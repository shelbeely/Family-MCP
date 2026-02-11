import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const TOKEN_STORE_PATH = join(homedir(), '.family-mcp-tokens');
const ALGORITHM = 'aes-256-gcm';

interface StoredToken {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

export class EncryptedTokenStore {
  private password: string;

  constructor(password?: string) {
    const passwordInput = password || process.env.COPILOT_MCP_FAMILY_MCP_PASSWORD || process.env.FAMILY_MCP_PASSWORD;
    
    if (!passwordInput) {
      console.warn('Warning: Using default password for token encryption. Set FAMILY_MCP_PASSWORD (or COPILOT_MCP_FAMILY_MCP_PASSWORD for GitHub Copilot) environment variable for better security.');
      this.password = 'default-password-change-me';
    } else {
      this.password = passwordInput;
    }
  }

  private getKey(salt: Buffer): Buffer {
    return scryptSync(this.password, salt, 32);
  }

  encrypt(token: string): StoredToken {
    const salt = randomBytes(16);
    const iv = randomBytes(16);
    const key = this.getKey(salt);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  decrypt(stored: StoredToken): string {
    const key = this.getKey(Buffer.from(stored.salt, 'hex'));
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(stored.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(stored.tag, 'hex'));

    let decrypted = decipher.update(stored.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  saveToken(token: string): void {
    const stored = this.encrypt(token);
    writeFileSync(TOKEN_STORE_PATH, JSON.stringify(stored, null, 2));
  }

  loadToken(): string | null {
    try {
      if (!existsSync(TOKEN_STORE_PATH)) {
        return null;
      }
      const data = readFileSync(TOKEN_STORE_PATH, 'utf8');
      const stored: StoredToken = JSON.parse(data);
      return this.decrypt(stored);
    } catch (error) {
      console.error('Failed to load token:', error);
      return null;
    }
  }

  deleteToken(): void {
    try {
      if (existsSync(TOKEN_STORE_PATH)) {
        writeFileSync(TOKEN_STORE_PATH, '');
      }
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
  }
}
