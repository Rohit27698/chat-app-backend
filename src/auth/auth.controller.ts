import { Controller, Post, Body, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      return await this.authService.signUp(signUpDto.username, signUpDto.email, signUpDto.password);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      return await this.authService.signIn(signInDto.email, signInDto.password);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('users/search')
  async searchUsers(@Query('q') query: string, @Query('currentUserId') currentUserId: string) {
    try {
      const users = await this.userModel.find({
        $and: [
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          },
          { _id: { $ne: currentUserId } } // Exclude current user
        ]
      }).select('-password -__v').exec();

      return users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
