import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { KeyType } from '../../common/enums/key-type.enum';
import { KeyService } from '../key/key.service';
import { User } from '../user/entities/user.entity';

export interface JwtPayload {
    sub: string;
    email: string;
}

export interface JwtToken {
    accessToken: string;
    refreshToken: string;
}
/**
 * The JwtServiceGenerateToken class.
 */
@Injectable()
export class JwtServiceGenerateToken {
    /**
     * @description Constructor of the JwtServiceGenerateToken
     * @param {JwtService} jwtService - The jwt service instance
     * @param {ConfigService} configService - The config service instance
     * @param {KeyService} keyService - The key service instance
     */
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly keyService: KeyService,
    ) {}

    /**
     * @description Generate an access token with the payload
     * @param {User} payload - The payload of the user
     * @returns {Promise<string>} - The access token of the user
     */
    async generateAccessToken(payload: User): Promise<string> {
        const key = await this.keyService.getCurrentSecretKey(KeyType.ACCESS_KEY);

        return await this.jwtService.signAsync(
            { sub: payload.id, email: payload.email },
            {
                secret: key.key,
                expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
                keyid: key.id,
            },
        );
    }

    /**
     * @description Generate a refresh token with the payload
     * @param {User} payload - The payload
     * @returns {Promise<string>} - The refresh token
     */
    async generateRefreshToken(payload: User): Promise<string> {
        const key = await this.keyService.getCurrentSecretKey(KeyType.REFRESH_KEY);

        return await this.jwtService.signAsync(
            { sub: payload.id, email: payload.email },
            {
                secret: key.key,
                expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
                keyid: key.id,
            },
        );
    }

    /**
     *
     * @param {User} payload - The payload
     * @returns {Promise<JwtToken>} - The access token and refresh token
     */
    async generateToken(payload: User): Promise<JwtToken> {
        return {
            accessToken: await this.generateAccessToken(payload),
            refreshToken: await this.generateRefreshToken(payload),
        };
    }
}
