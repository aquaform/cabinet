import { EnvironmentsInterface } from './environment.interface';
import { SettingsService } from '@modules/root/settings/settings.service';

const settings = new SettingsService();

export const environment: EnvironmentsInterface = {
  production: false,
  displayLog: settings.DisplayLog(),
  defaultLang: settings.Language()
};
