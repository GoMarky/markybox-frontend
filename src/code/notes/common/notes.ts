import * as markybox from '@/core';
import { createDecorator } from '@/platform/instantiation/common/instantiation';
import { UserNotesStore } from '@/code/notes/browser/note-service';
import { SocketConnection } from '@/code/socket/browser/socket';
import { IBaseSocketMessagePayload, ISocketMessageResponse } from '@/code/socket/common/socket-service';

export namespace Note {
  export type NoteId = string;
  export type NoteContent = string;
  export type NoteLang = markybox.EditorLang;
}

export interface INoteInfo {
  id: Note.NoteId;
  title: string;
  createdAt: number;
  updatedAt: number;
  lang: Note.NoteLang;
  data: Note.NoteContent;
}

export interface INoteService {
  readonly connection: SocketConnection<IBaseSocketMessagePayload, ISocketMessageResponse>;
  readonly store: UserNotesStore;

  createNoteAfterLogin: boolean;

  createOrEnterRoom(noteId: Note.NoteId): void;

  getNoteById(noteId: Note.NoteId): Promise<INoteInfo>;

  createNote(title?: string): Promise<Note.NoteId>;

  deleteNote(noteId: Note.NoteId): Promise<void>;

  updateNote(noteId: Note.NoteId, data: Note.NoteContent, lang?: Note.NoteLang): Promise<void>;
}

export const INoteService = createDecorator<INoteService>('noteService');
