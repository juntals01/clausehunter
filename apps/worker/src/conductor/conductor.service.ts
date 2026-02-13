import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ConductorClient,
    TaskManager,
    orkesConductorClient,
} from '@io-orkes/conductor-javascript';

@Injectable()
export class ConductorService implements OnModuleInit, OnModuleDestroy {
    private client: ConductorClient;
    private taskManager: TaskManager;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const serverUrl = this.configService.get<string>(
            'CONDUCTOR_SERVER_URL',
            'http://localhost:8081/api',
        );

        this.client = await orkesConductorClient({
            serverUrl,
        });
    }

    async startWorker(taskType: string, execute: (task: any) => Promise<any>) {
        this.taskManager = new TaskManager(
            this.client,
            [
                {
                    taskDefName: taskType,
                    execute: async (task) => {
                        try {
                            console.log(`Executing task: ${taskType}`, task.taskId);
                            const outputData = await execute(task);
                            return {
                                status: 'COMPLETED',
                                outputData,
                            };
                        } catch (error) {
                            console.error(`Error executing task ${taskType}:`, error);
                            return {
                                status: 'FAILED',
                                reasonForIncompletion: error.message,
                            };
                        }
                    },
                },
            ],
            {
                pollInterval: 1000,
                concurrency: 1,
            } as any, // Cast to any to avoid type issues with pollInterval
        );

        this.taskManager.startPolling();
        console.log(`Started polling for task: ${taskType}`);
    }

    async startWorkflow(name: string, version: number, input: any) {
        // The client object structure depends on the SDK version, accessing workflowResource safely
        return (this.client as any).workflowResource.startWorkflow({
            name,
            version,
            input,
        });
    }

    onModuleDestroy() {
        if (this.taskManager) {
            this.taskManager.stopPolling();
        }
    }
}
