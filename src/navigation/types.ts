import { NavigatorScreenParams } from '@react-navigation/native';

// Parameters for the Bottom Tab Navigator
export type MainTabParamList = {
  Today: undefined;
  Other: undefined;
  QuickNotes: undefined;
  Completed: undefined;
  Settings: undefined;
};

// Parameters for the Root Stack Navigator
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AddWork: undefined;
  WorkDetails: { workId: string };
  EditWork: { workId: string };
  AddNote: undefined;
  NoteDetails: { noteId: string };
  Search: undefined;
};
