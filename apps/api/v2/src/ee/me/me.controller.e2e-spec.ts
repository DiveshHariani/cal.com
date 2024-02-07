import { bootstrap } from "@/app";
import { AppModule } from "@/app.module";
import { SchedulesRepository } from "@/ee/schedules/schedules.repository";
import { SchedulesService } from "@/ee/schedules/services/schedules.service";
import { AvailabilitiesModule } from "@/modules/availabilities/availabilities.module";
import { UserResponse } from "@/modules/oauth-clients/controllers/oauth-client-users/zod/response/response";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { UpdateUserInput } from "@/modules/users/inputs/update-user.input";
import { UsersModule } from "@/modules/users/users.module";
import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { User } from "@prisma/client";
import * as request from "supertest";
import { UserRepositoryFixture } from "test/fixtures/repository/users.repository.fixture";
import { withAccessTokenAuth } from "test/utils/withAccessTokenAuth";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import { ApiSuccessResponse } from "@calcom/platform-types";

describe("Me Endpoints", () => {
  describe("User Authentication", () => {
    let app: INestApplication;

    let userRepositoryFixture: UserRepositoryFixture;

    const userEmail = "me-controller-e2e@api.com";
    let user: User;

    beforeAll(async () => {
      const moduleRef = await withAccessTokenAuth(
        userEmail,
        Test.createTestingModule({
          imports: [AppModule, PrismaModule, AvailabilitiesModule, UsersModule],
          providers: [SchedulesRepository, SchedulesService],
        })
      ).compile();

      userRepositoryFixture = new UserRepositoryFixture(moduleRef);

      user = await userRepositoryFixture.create({
        email: userEmail,
      });

      app = moduleRef.createNestApplication();
      bootstrap(app as NestExpressApplication);

      await app.init();
    });

    it("should be defined", () => {
      expect(userRepositoryFixture).toBeDefined();
      expect(user).toBeDefined();
    });

    it("should get user associated with access token", async () => {
      return request(app.getHttpServer())
        .get("/api/v2/me")
        .expect(200)
        .then((response) => {
          const responseBody: ApiSuccessResponse<{ user: UserResponse }> = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);

          expect(responseBody.data?.user?.id).toEqual(user.id);
          expect(responseBody.data?.user?.email).toEqual(user.email);
          expect(responseBody.data?.user?.timeFormat).toEqual(user.timeFormat);
          expect(responseBody.data?.user?.defaultScheduleId).toEqual(user.defaultScheduleId);
          expect(responseBody.data?.user?.weekStart).toEqual(user.weekStart);
          expect(responseBody.data?.user?.timeZone).toEqual(user.timeZone);
        });
    });

    it("should update user associated with access token", async () => {
      const body: UpdateUserInput = { timeZone: "Europe/Rome" };

      return request(app.getHttpServer())
        .patch("/api/v2/me")
        .send(body)
        .expect(200)
        .then((response) => {
          const responseBody: ApiSuccessResponse<{ user: UserResponse }> = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);

          expect(responseBody.data?.user?.id).toEqual(user.id);
          expect(responseBody.data?.user?.email).toEqual(user.email);
          expect(responseBody.data?.user?.timeFormat).toEqual(user.timeFormat);
          expect(responseBody.data?.user?.defaultScheduleId).toEqual(user.defaultScheduleId);
          expect(responseBody.data?.user?.weekStart).toEqual(user.weekStart);
          expect(responseBody.data?.user?.timeZone).toEqual(body.timeZone);
        });
    });

    it("should not update user associated with access token given invalid timezone", async () => {
      const bodyWithIncorrectTimeZone: UpdateUserInput = { timeZone: "Narnia/Woods" };

      return request(app.getHttpServer()).patch("/api/v2/me").send(bodyWithIncorrectTimeZone).expect(400);
    });

    it("should not update user associated with access token given invalid time format", async () => {
      const bodyWithIncorrectTimeFormat: UpdateUserInput = { timeFormat: 100 };

      return request(app.getHttpServer()).patch("/api/v2/me").send(bodyWithIncorrectTimeFormat).expect(400);
    });

    it("should not update user associated with access token given invalid week start", async () => {
      const bodyWithIncorrectWeekStart: UpdateUserInput = { weekStart: "waba luba dub dub" };

      return request(app.getHttpServer()).patch("/api/v2/me").send(bodyWithIncorrectWeekStart).expect(400);
    });

    afterAll(async () => {
      await userRepositoryFixture.deleteByEmail(user.email);
      await app.close();
    });
  });
});