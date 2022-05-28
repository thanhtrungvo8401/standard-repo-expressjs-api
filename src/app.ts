import 'reflect-metadata';
import express from "express";

// Services:
import { DBMongo } from "./services/db-mongo";

// Routes:
import { RoutesConfig } from './routes';

// Types:
import { ApplicationOptions, AppService } from './types';
import Container from 'typedi';

class Application {
    private port: Number;
    private services: Function[];

    constructor(private app: express.Express, private options: ApplicationOptions) {
        console.group('=======================================')
        console.log("APPLICATION start installing\n")
        this.port = this.options.port;
        this.services = this.options.services;
    }

    async start() {
        await this.installService();

        await this.installRoutes(); 

        this.app.listen(this.port, () => {
            console.log(`\nApplication successfully started at port: ${this.port}`);
            console.log('=======================================')
            console.groupEnd()
        })
    }

    private async installService() {
        for (const Service of this.services) {
            await (Container.get(Service) as AppService).install();
            console.log(`${Service.name} installed successfully`);
        }
    }

    private async installRoutes() {
        RoutesConfig.config(this.app);
    }
}

const app = new Application(express(), { port: 8080, services: [DBMongo] });

app.start();
