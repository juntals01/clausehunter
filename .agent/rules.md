# Global Agent Rules

## Security Requirements

### Environment Variables & Secrets
- **NEVER hardcode passwords, API keys, tokens, or any sensitive data** in source code
- **ALL sensitive configuration MUST be stored in `.env` files**
- Ensure `.env` is listed in `.gitignore` (never commit to version control)
- **MUST maintain `.env.example`** with sample/placeholder values for all environment variables
- Follow these practices:
  - Use descriptive environment variable names (e.g., `DATABASE_PASSWORD`, `JWT_SECRET`, `API_KEY`)
  - Access environment variables through proper configuration modules (NestJS: `@nestjs/config`, Next.js: `process.env`)
  - Never log sensitive environment variables
  - Use different `.env` files for different environments (`.env.development`, `.env.production`)
  - Keep `.env.example` in sync whenever new environment variables are added
  - Include comments in `.env.example` to document each variable's purpose
  - Use placeholder values that clearly indicate the expected format (e.g., `your-secret-key-here`, `postgres`, `5432`)

### Example .env.example
```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=clausehunter
DATABASE_USER=postgres
DATABASE_PASSWORD=your-database-password-here

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-minio-secret-key-here

# API Configuration
API_PORT=3001
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# External Services
KIMI_API_KEY=your-kimi-api-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password-here
```

### Example
```typescript
// ❌ WRONG - Never do this
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'mySecretPassword123';

// ✅ CORRECT - Always use environment variables
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;
```

## NestJS Backend Requirements

### Database ORM
- **MUST use TypeORM** for all database operations in NestJS applications
- Do not use Prisma, Sequelize, or other ORMs unless explicitly requested
- Follow TypeORM best practices:
  - Use decorators for entity definitions (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.)
  - Use repository pattern with `@InjectRepository()`
  - Implement proper relations (`@OneToMany`, `@ManyToOne`, `@ManyToMany`)
  - Use migrations for schema changes
  - Leverage TypeORM query builder for complex queries when needed

### Example Structure
When creating NestJS modules that interact with databases:
```typescript
// Entity example
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;
}

// Service example
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
}
```

### API Validation
- **MUST validate all incoming data** on API endpoints
- Use `class-validator` and `class-transformer` with DTOs (Data Transfer Objects)
- Enable global validation pipe in NestJS
- Follow validation best practices:
  - Create DTOs for all request bodies, query params, and path params
  - Use decorators from `class-validator` (`@IsString()`, `@IsEmail()`, `@IsNotEmpty()`, etc.)
  - Implement custom validators when needed
  - Return clear validation error messages
  - Validate nested objects and arrays
  - Use `@Type()` decorator for proper type transformation

### Example API Validation
```typescript
// main.ts - Enable global validation
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}

// DTO example
import { IsString, IsNotEmpty, IsDate, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  renewalDate: Date;

  @IsNumber()
  @Min(0)
  amount: number;
}

// Controller example
@Controller('contracts')
export class ContractsController {
  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    // Data is automatically validated
    return this.contractsService.create(createContractDto);
  }
}
```


### File Storage
- **MUST use MinIO** for local file/object storage in development
- Use S3-compatible API for seamless transition to production (AWS S3, DigitalOcean Spaces, etc.)
- Follow MinIO best practices:
  - Configure MinIO service in `docker-compose.yml`
  - Use proper bucket policies and access controls
  - Store MinIO credentials in `.env` (never hardcode)
  - Use official MinIO client library or AWS SDK for S3
  - Implement proper error handling for upload/download operations

### Example MinIO Configuration
```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
```

```typescript
// NestJS MinIO Service Example
import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class StorageService {
  private minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async uploadFile(bucketName: string, fileName: string, file: Buffer) {
    await this.minioClient.putObject(bucketName, fileName, file);
  }
}
```

### Workflow Orchestration
- **MUST use Conductor** for complex workflow orchestration and task management
- Use Conductor for multi-step processes (OCR → AI extraction → data processing)
- Follow Conductor best practices:
  - Define workflows as JSON/code-based definitions
  - Configure Conductor service in `docker-compose.yml`
  - Use workers to execute tasks
  - Implement proper error handling and retries
  - Monitor workflow execution through Conductor UI
  - Store Conductor connection details in `.env`

### AI Integration
- **MUST use Kimi API** for AI-powered features (document extraction, analysis, etc.)
- Store API keys securely in `.env` (never hardcode)
- Follow AI integration best practices:
  - Implement proper error handling for API failures
  - Use retry logic with exponential backoff
  - Monitor API usage and costs
  - Cache results when appropriate
  - Validate AI responses before using them
  - Handle rate limits gracefully

### Example Conductor & Kimi Configuration
```yaml
# docker-compose.yml
services:
  conductor-server:
    image: conductor:server
    ports:
      - "8080:8080"
    environment:
      - CONFIG_PROP=config.properties
    depends_on:
      - postgres
      - redis

  conductor-ui:
    image: conductor:ui
    ports:
      - "5000:5000"
    environment:
      - WF_SERVER=http://conductor-server:8080/api
```

```typescript
// NestJS Kimi Service Example
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KimiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.moonshot.cn/v1';

  constructor() {
    this.apiKey = process.env.KIMI_API_KEY;
  }

  async extractContractData(text: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'user',
              content: `Extract contract details: ${text}`,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      // Implement retry logic and error handling
      throw new Error(`Kimi API error: ${error.message}`);
    }
  }
}
```

## Infrastructure Requirements

### Monorepo Structure
- **MUST use Turborepo** for monorepo management
- Organize code into logical workspaces (`apps/`, `packages/`)
- Follow Turborepo best practices:
  - Define tasks in root `turbo.json` with proper dependencies
  - Use workspace dependencies for shared code
  - Leverage caching for faster builds
  - Configure pipeline tasks (build, dev, lint, test)
  - Use `--filter` flag for targeted operations

### Containerization
- **MUST use Docker** for local development environment
- Use `docker-compose.yml` for orchestrating services (database, MinIO, Redis, etc.)
- Follow Docker best practices:
  - Use official base images when possible
  - Implement multi-stage builds for production
  - Use `.dockerignore` to exclude unnecessary files
  - Define health checks for services
  - Use named volumes for persistent data
  - Configure proper networking between services
  - Never include `.env` files in Docker images

### Example Docker Compose Structure
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### Development Workflow
- **MUST provide `npm run dev`** script in root package.json that starts ALL services
- This single command should:
  - Start Docker containers (PostgreSQL, Redis, MinIO) via `docker-compose up -d`
  - Start all Turborepo apps in development mode (API, Worker, Web)
  - Run in watch mode for hot reloading
- Use `concurrently` or similar tool to run multiple processes
- Ensure proper startup order (Docker services first, then apps)

### Example Development Script
```json
// Root package.json
{
  "scripts": {
    "dev": "docker-compose up -d && turbo run dev --parallel",
    "dev:services": "docker-compose up -d",
    "dev:apps": "turbo run dev --parallel"
  },
  "devDependencies": {
    "turbo": "latest",
    "concurrently": "^8.0.0"
  }
}
```

### Reset Scripts
- **MUST provide `npm run reset:all`** script in root package.json
- This script should completely reset the development environment:
  - Drop and recreate PostgreSQL database
  - Run all TypeORM migrations
  - Run database seeders
  - Clear all MinIO buckets and recreate them
- Provide individual reset scripts for flexibility:
  - `npm run reset:db` - Reset database only
  - `npm run reset:storage` - Reset MinIO only


### Example Reset Script Implementation
```json
// Root package.json
{
  "scripts": {
    "reset:all": "npm run reset:db && npm run reset:storage",
    "reset:db": "docker-compose exec postgres psql -U $DATABASE_USER -c 'DROP DATABASE IF EXISTS $DATABASE_NAME;' && docker-compose exec postgres psql -U $DATABASE_USER -c 'CREATE DATABASE $DATABASE_NAME;' && npm run migration:run && npm run seed",
    "reset:storage": "node scripts/reset-minio.js",
    "migration:run": "turbo run migration:run --filter=@app/api",
    "seed": "turbo run seed --filter=@app/api"
  }
}
```

```typescript
// scripts/reset-minio.js
import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function resetMinIO() {
  try {
    // List all buckets
    const buckets = await minioClient.listBuckets();
    
    // Remove all objects and buckets
    for (const bucket of buckets) {
      const objectsStream = minioClient.listObjects(bucket.name, '', true);
      for await (const obj of objectsStream) {
        await minioClient.removeObject(bucket.name, obj.name);
      }
      await minioClient.removeBucket(bucket.name);
    }
    
    // Recreate required buckets
    const requiredBuckets = ['contracts', 'documents'];
    for (const bucketName of requiredBuckets) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✓ Created bucket: ${bucketName}`);
    }
    
    console.log('✓ MinIO storage reset complete');
  } catch (error) {
    console.error('Error resetting MinIO:', error);
    process.exit(1);
  }
}

resetMinIO();
```


## Frontend (Next.js/React) Requirements

### Form Handling
- **MUST use React Hook Form** (`useForm`) for all form state management
- Do not use uncontrolled forms or other form libraries unless explicitly requested
- Follow React Hook Form best practices:
  - Use `useForm` hook with proper TypeScript types
  - Leverage `control` prop for controlled components
  - Use `register` for simple inputs
  - Use `Controller` for custom/third-party components
  - Implement proper error handling with `formState.errors`

### Validation
- **MUST use Zod** for schema validation
- Integrate Zod with React Hook Form using `@hookform/resolvers/zod`
- Follow Zod best practices:
  - Define schemas with proper TypeScript inference
  - Use `z.infer<typeof schema>` for type safety
  - Implement reusable validation schemas
  - Provide clear error messages

### Data Fetching & State Management
- **MUST use React Query (TanStack Query)** for server state management
- Do not use Redux, Zustand, or other state management for server data unless explicitly requested
- Follow React Query best practices:
  - Use `useQuery` for GET requests
  - Use `useMutation` for POST/PUT/DELETE requests
  - Implement proper query keys for cache management
  - Leverage `queryClient.invalidateQueries()` after mutations
  - Use `enabled` option for dependent queries
  - Implement proper loading and error states

### Example Structure
```typescript
// Zod schema
const contractSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  renewalDate: z.date(),
  amount: z.number().positive(),
});

type ContractFormData = z.infer<typeof contractSchema>;

// Component with form
function ContractForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ContractFormData) => api.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  const onSubmit = (data: ContractFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <input {...field} />
        )}
      />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}

// Data fetching
function ContractList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => api.getContracts(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render contracts */}</div>;
}
```
