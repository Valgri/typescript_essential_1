interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
}

class Observer<T> {
  private handlers: ObserverHandlers<T>;
  private isUnsubscribed: boolean = false;

  constructor(handlers: ObserverHandlers<T>) {
    this.handlers = handlers;
  }

  next(value: T) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: any) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  private _unsubscribe?: () => void;
}

class Observable<T> {
  private _subscribe: (observer: Observer<T>) => (() => void);

  constructor(subscribe: (observer: Observer<T>) => (() => void)) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]) {
    return new Observable<T>((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: ObserverHandlers<T>) {
    const observer = new Observer<T>(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

interface Request {
  method: string;
  host: string;
  path: string;
  body?: any;
  params: { [key: string]: string };
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: Request[] = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: Request): { status: number } => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

const handleError = (error: any): { status: number } => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
