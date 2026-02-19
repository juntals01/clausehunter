import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
    constructor(private contactService: ContactService) {}

    @Post()
    @HttpCode(200)
    submit(@Body() dto: ContactDto) {
        return this.contactService.submitContact(dto);
    }
}
