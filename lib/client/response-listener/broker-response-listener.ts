import { RequestTimeoutError } from '../../errors/request-timeout.error';
import { BrokerEventData } from '../../interfaces/broker-event-data.interface';
import { BrokerEvent } from '../../interfaces/broker-event.interface';
import { ListenerFactory } from '../listener-adapter/factory/listener-factory';
import { ListenerAdapter } from '../listener-adapter/listener-adapter.interface';

type BrokerListener = (response: BrokerEventData) => void;

export class BrokerResponseListener {
  private readonly PROMISE_TIMEOUT: number = 30;
  private listenerAdapter: ListenerAdapter;
  private timeout: NodeJS.Timeout;

  constructor(private brokerEvent: BrokerEvent) {
    this.listenerAdapter = ListenerFactory.createListener();
  }

  public async listen(): Promise<BrokerEventData> {
    return this.composeListener().then(
      (value) => {
        this.cleanUp();

        return <BrokerEventData>value;
      },
      () => {
        this.cleanUp();

        throw new RequestTimeoutError();
      },
    );
  }

  private composeListener<T>(): Promise<T> {
    return new Promise((resolve, reject) => {
      const listener = this.createListener(resolve);

      this.listenerAdapter.listen(this.brokerEvent.data.pattern, listener);
      this.setResponseTimeout(reject);
    });
  }

  private createListener(resolve: (value?: unknown) => void): BrokerListener {
    return (response) => {
      if (this.isExpectedResponse(response)) {
        resolve(response);
      }
    };
  }

  private isExpectedResponse(response: BrokerEventData): boolean {
    return response.eventId === this.getEventId() && response.type === 'RESPONSE';
  }

  private setResponseTimeout(reject: (reason: any) => void) {
    this.timeout = setTimeout(() => reject('Request timeout.'), this.PROMISE_TIMEOUT * 1000);
  }

  private cleanUp(): void {
    this.listenerAdapter.removeListener();
    clearTimeout(this.timeout);
  }

  private getEventId(): string {
    return this.brokerEvent.data.eventId;
  }
}
