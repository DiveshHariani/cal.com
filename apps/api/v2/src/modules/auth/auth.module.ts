import { ApiKeyModule } from "@/modules/api-key/api-key.module";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token/access-token.guard";
import { NextAuthGuard } from "@/modules/auth/guards/next-auth/next-auth.guard";
import { ApiAuthStrategy } from "@/modules/auth/strategies/api-auth/api-auth.strategy";
import { ApiKeyAuthStrategy } from "@/modules/auth/strategies/api-key-auth/api-key-auth.strategy";
import { NextAuthStrategy } from "@/modules/auth/strategies/next-auth/next-auth.strategy";
import { DeploymentsModule } from "@/modules/deployments/deployments.module";
import { MembershipsModule } from "@/modules/memberships/memberships.module";
import { OAuthFlowService } from "@/modules/oauth-clients/services/oauth-flow.service";
import { RedisModule } from "@/modules/redis/redis.module";
import { TokensModule } from "@/modules/tokens/tokens.module";
import { UsersModule } from "@/modules/users/users.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [
    PassportModule,
    RedisModule,
    ApiKeyModule,
    UsersModule,
    MembershipsModule,
    TokensModule,
    DeploymentsModule,
  ],
  providers: [
    ApiKeyAuthStrategy,
    NextAuthGuard,
    NextAuthStrategy,
    AccessTokenGuard,
    ApiAuthStrategy,
    OAuthFlowService,
  ],
  exports: [NextAuthGuard, AccessTokenGuard],
})
export class AuthModule {}
