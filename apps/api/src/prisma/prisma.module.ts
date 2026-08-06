import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Global so feature modules can inject PrismaService without each one
 *  re-importing it — the connection itself is the cross-cutting concern. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
