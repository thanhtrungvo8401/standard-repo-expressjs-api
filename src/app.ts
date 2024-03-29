import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

// Services:
import { DBMongo } from "./3rd-party-services/db-mongo";

// Routes:
import { RoutesConfig } from "./routes";

// Types:
import { ApplicationOptions } from "./types/application";
import { AppService } from "./abstract/app-service";
import Container from "typedi";

class Application {
  private port: Number;
  private services: Function[];

  constructor(
    private app: express.Express,
    private options: ApplicationOptions
  ) {
    console.group("=======================================");
    console.log("APPLICATION start installing\n");
    this.port = this.options.port;
    this.services = this.options.services;
  }

  async start() {
    await this.installService();

    await this.installAppMiddleware();

    await this.installRoutes();

    await this.installErrorHandler();

    this.app.listen(this.port, () => {
      console.log(`\nApplication successfully started at port: ${this.port}`);
      console.log("=======================================");
      console.groupEnd();
    });
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

  private async installAppMiddleware() {
    this.app.use(bodyParser.json());

    this.app.use(
      morgan(":method :url :status :res[content-length] - :response-time ms")
    );

    this.app.use(cors());
  }

  private async installErrorHandler() {
    this.app.use(
      (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        res.json({ success: false, err });
      }
    );
  }
}

const app = new Application(express(), { port: 8080, services: [DBMongo] });

app.start();
