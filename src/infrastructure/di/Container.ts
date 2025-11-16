/**
 * Dependency Injection Container
 * Manages service instantiation and dependency injection
 * Demonstrates: Inversion of Control (IoC), Dependency Injection Pattern, Singleton Pattern
 */
import { PrismaClient } from '@prisma/client';
import { BookingService } from '@/application/services/BookingService';
import { PropertyService } from '@/application/services/PropertyService';
import { UserService } from '@/application/services/UserService';
import { FavoriteService } from '@/application/services/FavoriteService';
import { PrismaBookingRepository } from '../repositories/PrismaBookingRepository';
import { PrismaPropertyRepository } from '../repositories/PrismaPropertyRepository';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaFavoriteRepository } from '../repositories/PrismaFavoriteRepository';
import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { IPropertyRepository } from '@/domain/repositories/IPropertyRepository';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';

/**
 * Service container that manages all dependencies
 * Uses singleton pattern to ensure single instance
 */
class ServiceContainer {
  private static instance: ServiceContainer;
  private prisma: PrismaClient;

  // Repository instances
  private _bookingRepository?: IBookingRepository;
  private _propertyRepository?: IPropertyRepository;
  private _userRepository?: IUserRepository;
  private _favoriteRepository?: IFavoriteRepository;

  // Service instances
  private _bookingService?: BookingService;
  private _propertyService?: PropertyService;
  private _userService?: UserService;
  private _favoriteService?: FavoriteService;

  private constructor() {
    // Initialize Prisma client
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Get Prisma client
   */
  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * Get Booking Repository (lazy initialization)
   */
  public getBookingRepository(): IBookingRepository {
    if (!this._bookingRepository) {
      this._bookingRepository = new PrismaBookingRepository(this.prisma);
    }
    return this._bookingRepository;
  }

  /**
   * Get Property Repository (lazy initialization)
   */
  public getPropertyRepository(): IPropertyRepository {
    if (!this._propertyRepository) {
      this._propertyRepository = new PrismaPropertyRepository(this.prisma);
    }
    return this._propertyRepository;
  }

  /**
   * Get User Repository (lazy initialization)
   */
  public getUserRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new PrismaUserRepository(this.prisma);
    }
    return this._userRepository;
  }

  /**
   * Get Favorite Repository (lazy initialization)
   */
  public getFavoriteRepository(): IFavoriteRepository {
    if (!this._favoriteRepository) {
      this._favoriteRepository = new PrismaFavoriteRepository(this.prisma);
    }
    return this._favoriteRepository;
  }

  /**
   * Get Booking Service (lazy initialization with automatic dependency injection)
   */
  public getBookingService(): BookingService {
    if (!this._bookingService) {
      this._bookingService = new BookingService(
        this.getBookingRepository(),
        this.getPropertyRepository(),
        this.getUserRepository()
      );
    }
    return this._bookingService;
  }

  /**
   * Get Property Service (lazy initialization with automatic dependency injection)
   */
  public getPropertyService(): PropertyService {
    if (!this._propertyService) {
      this._propertyService = new PropertyService(
        this.getPropertyRepository(),
        this.getUserRepository(),
        this.getBookingRepository()
      );
    }
    return this._propertyService;
  }

  /**
   * Get User Service (lazy initialization with automatic dependency injection)
   */
  public getUserService(): UserService {
    if (!this._userService) {
      this._userService = new UserService(
        this.getUserRepository(),
        this.getPropertyRepository(),
        this.getBookingRepository()
      );
    }
    return this._userService;
  }

  /**
   * Get Favorite Service (lazy initialization with automatic dependency injection)
   */
  public getFavoriteService(): FavoriteService {
    if (!this._favoriteService) {
      this._favoriteService = new FavoriteService(
        this.getFavoriteRepository(),
        this.getPropertyRepository()
      );
    }
    return this._favoriteService;
  }

  /**
   * Cleanup resources
   */
  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const container = ServiceContainer.getInstance();

// Export convenience functions for getting services
export const getBookingService = () => container.getBookingService();
export const getPropertyService = () => container.getPropertyService();
export const getUserService = () => container.getUserService();
export const getFavoriteService = () => container.getFavoriteService();

// Export convenience functions for getting repositories
export const getBookingRepository = () => container.getBookingRepository();
export const getPropertyRepository = () => container.getPropertyRepository();
export const getUserRepository = () => container.getUserRepository();
export const getFavoriteRepository = () => container.getFavoriteRepository();

// Export Prisma client
export const getPrisma = () => container.getPrisma();
