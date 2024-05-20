import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePayableDto } from './dtos/create-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdatePayableDto } from './dtos/update-payable.dto';

@Injectable()
export class PayableService {
  constructor(private readonly prisma: PrismaService) {}
  create({ assignorId, emissionDate, value }: CreatePayableDto) {
    return this.prisma.payable.create({
      data: {
        value,
        assignorId,
        emissionDate: new Date(emissionDate),
      },
    });
  }

  async findById(id: string) {
    const payable = await this.prisma.payable.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        value: true,
        emissionDate: true,
        assignorId: true,
      },
    });

    if (!payable) {
      throw new NotFoundException('Payable not found');
    }

    return payable;
  }

  async delete(id: string) {
    try {
      await this.prisma.payable.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      // record not found
      // https://www.prisma.io/docs/orm/reference/error-reference#p2025
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Payable not found.`);
      }

      throw error;
    }
  }

  async update(id: string, { emissionDate, value }: UpdatePayableDto) {
    try {
      const payable = await this.prisma.payable.update({
        where: {
          id,
        },
        data: {
          ...(emissionDate
            ? {
                emissionDate: new Date(emissionDate),
              }
            : {}),
          ...(value
            ? {
                value,
              }
            : {}),
        },
      });

      return payable;
    } catch (error) {
      // record not found
      // https://www.prisma.io/docs/orm/reference/error-reference#p2025
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Payable not found.`);
      }

      throw error;
    }
  }
}
