import { Global, Injectable, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv, type Env } from './env.schema';

@Injectable()
export class TypedConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}
  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }
}

/** Typed wrapper around @nestjs/config's ConfigService so callers get
 *  autocomplete + compile-time checked keys instead of stringly-typed gets.
 *  @Global so every feature module can inject TypedConfigService without
 *  importing this module itself, matching the underlying NestConfigModule's
 *  isGlobal: true. */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['../../.env', '.env'],
    }),
  ],
  providers: [
    {
      provide: TypedConfigService,
      useFactory: (config: ConfigService<Env, true>) => new TypedConfigService(config),
      inject: [ConfigService],
    },
  ],
  exports: [TypedConfigService],
})
export class ConfigModule {}
