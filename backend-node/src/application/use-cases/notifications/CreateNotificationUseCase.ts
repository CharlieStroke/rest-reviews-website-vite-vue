import { injectable, inject } from "tsyringe";
import { Notification } from "../../../domain/entities/Notification";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

interface CreateNotificationDTO {
  userId: string;
  reviewId: string;
  type?: string;
}

@injectable()
export class CreateNotificationUseCase {
  constructor(
    @inject("INotificationRepository")
    private notificationRepository: INotificationRepository,
  ) {}

  async execute(dto: CreateNotificationDTO): Promise<Notification> {
    const notification = Notification.create({
      userId: dto.userId,
      reviewId: dto.reviewId,
      type: dto.type ?? "manager_reply",
    });
    return this.notificationRepository.save(notification);
  }
}
