import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { RatesDTO } from "./rates.dto";

export abstract class HiringDTO extends RatesDTO {

    @ApiPropertyOptional({ type: () => Date })
    @IsOptional()
    @IsString({
        message: "Offer date on must be a Date string"
    })
    readonly offerDate?: Date;

    @ApiPropertyOptional({ type: () => Date })
    @IsOptional()
    @IsString({
        message: "Accept date on must be a Date string"
    })
    readonly acceptDate?: Date;

    @ApiPropertyOptional({ type: () => Date })
    @IsOptional()
    @IsString({
        message: "Reject date on must be a Date string"
    })
    readonly rejectDate?: Date;
}