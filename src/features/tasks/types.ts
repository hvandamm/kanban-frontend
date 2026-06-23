// TypeScript interfaces matching backend DTOs


export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskDto {
  id: number;
  boardId: number;
  title: string;
  description: string;
  status: TaskStatus;
 // createdAt: string;
 // updatedAt: string;
}

export interface BoardDto {
  id: number;
  name: string;
 // tasks: TaskDto[];
}