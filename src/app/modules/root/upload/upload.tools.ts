import { Observable } from 'rxjs';

export const base64URLToData = (base64URL: string): string => {
    return base64URL.split(',')[1];
};

export const fileToBase64 = (file: File): Observable<string> => {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = base64URLToData(reader.result as string);
        observer.next(result);
        observer.complete();
      };
      reader.onerror = err => observer.error(err);
    });
  };
