import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signUp(username: string, email: string, password: string): Promise<{ token: string; user: any }> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = this.jwtService.sign({ userId: user._id, email: user.email });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
      },
    };
  }

  async signIn(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = this.jwtService.sign({ userId: user._id, email: user.email });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password');
    return user;
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  async setUserOnline(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });
  }
}
