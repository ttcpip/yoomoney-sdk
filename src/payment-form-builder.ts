/* eslint-disable no-invalid-this */
import { FormBuilder } from "redirect-form-builder";
import type { URL } from "url";

/* eslint-disable no-useless-constructor */
export type FormConfig = {
  /**
   * Номер кошелька ЮMoney, на который нужно зачислять деньги отправителей.
   */
  receiver: string;
  /**
   * Возможные значения:
   *
   * `shop` — для универсальной формы;
   *
   * `small` — для кнопки;
   *
   * `donate` — для «благотворительной» формы.
   */
  quickPayForm: "shop" | "small" | "donate";

  /**
   * Назначение платежа. (До 150 символов)
   */
  targets: string;

  /**
   * Способ оплаты. Возможные значения:
   *
   * `PC` — оплата из кошелька ЮMoney;
   *
   * `AC` — с банковской карты;
   *
   * `MC` — с баланса мобильного.
   */
  paymentType: "PC" | "AC" | "MC";

  /**
   * Сумма перевода (спишется с отправителя).
   */
  sum: number;

  /**
   * Название перевода в истории отправителя (для переводов из кошелька или с привязанной карты). Отображается в кошельке отправителя.
   *
   * Удобнее всего формировать его из названий магазина и товара. Например: `Мой магазин: валенки белые`
   */
  formComment?: string;
  /** Название перевода на странице подтверждения. Рекомендуем делать его таким же, как `formComment`. */
  shortDest?: string;
  /** Метка, которую сайт или приложение присваивает конкретному переводу. Например, в качестве метки можно указывать код или идентификатор заказа. (До 64 символов) */
  label?: string;
  /** Поле, в котором можно передать комментарий отправителя перевода. (До 200 символов) */
  comment?: string;
  /** URL-адрес для редиректа после совершения перевода. */
  successURL?: string;
  /** Нужны ФИО отправителя. */
  needFio?: boolean;
  /** Нужна электронная почты отправителя. */
  needEmail?: boolean;
  /** Нужен телефон отправителя. */
  needPhone?: boolean;
  /** Нужен адрес отправителя. */
  needAddress?: boolean;
};

type FormQueryObject = Record<
  "receiver" | "quickpay-form" | "targets" | "paymentType" | "sum",
  string
> &
  Partial<
    Record<
      | "formcomment"
      | "short-dest"
      | "label"
      | "comment"
      | "successURL"
      | "need-fio"
      | "need-email"
      | "need-phone"
      | "need-address",
      string
    >
  >;

/**
 *
 * @param {FormConfig} config
 * @return {FormQueryObject}
 */
function convert(config: FormConfig): FormQueryObject {
  return {
    "quickpay-form": config.quickPayForm,
    paymentType: config.paymentType,
    receiver: config.receiver,
    sum: config.sum.toString(),
    targets: config.targets,
    "need-address": String(!!config.needAddress),
    "need-email": String(!!config.needEmail),
    "need-fio": String(!!config.needFio),
    "need-phone": String(!!config.needPhone),
    "short-dest": config.shortDest,
    comment: config.comment,
    formcomment: config.formComment,
    label: config.label,
    successURL: config.successURL
  };
}

/**
 * Генерирует HTML формы для переводов
 */
export class PaymentFromBuilder {
  /**
   *
   * @param {FormConfig=} config Изначальные настройки формы
   */
  constructor(
    public readonly config: FormConfig = {
      paymentType: "PC",
      receiver: "",
      sum: 100,
      quickPayForm: "shop",
      targets: ""
    }
  ) {}

  /**
   * Генерирует стандартные сеттеры
   *
   * @param {string} field
   * @return {Function}
   */
  private _makeSetter<T extends keyof FormConfig>(field: T) {
    return (value: FormConfig[T]) => {
      this.config[field] = value;
      return this;
    };
  }

  /**
   * Задаёт сумму платежа
   *
   * @param {string | number} amount Сумма
   * @return {this}
   */
  setAmount(amount: number | string): this {
    this.config.sum = Number.parseFloat(amount.toString());
    return this;
  }

  /**
   * Задаёт получателя платежа
   *
   * @param {string | number} receiver Получатель
   * @return {this}
   */
  setReceiver(receiver: number | string): this {
    this.config.receiver = receiver.toString();
    return this;
  }

  /**
   * Задаёт URL перенаправления после успешного платежа
   *
   * @param {string | URL} url URL
   * @return {this}
   */
  setSuccessURL(url: string | URL): this {
    this.config.successURL = url.toString();
    return this;
  }

  readonly setTargets = this._makeSetter("targets");
  readonly setPaymentType = this._makeSetter("paymentType");
  readonly setQuickPayForm = this._makeSetter("quickPayForm");
  readonly setType = this._makeSetter("quickPayForm");
  readonly setFormComment = this._makeSetter("formComment");
  readonly setShortDest = this._makeSetter("shortDest");
  readonly setLabel = this._makeSetter("label");
  readonly setComment = this._makeSetter("comment");

  /**
   *
   * @param {boolean} doRequire
   * @return {this}
   */
  requireFio(doRequire = true): this {
    this.config.needFio = doRequire;
    return this;
  }

  /**
   *
   * @param {boolean} doRequire
   * @return {this}
   */
  requireAddress(doRequire = true): this {
    this.config.needAddress = doRequire;
    return this;
  }

  /**
   *
   * @param {boolean} doRequire
   * @return {this}
   */
  requireEmail(doRequire = true): this {
    this.config.needEmail = doRequire;
    return this;
  }

  /**
   *
   * @param {boolean} doRequire
   * @return {this}
   */
  requirePhone(doRequire = true): this {
    this.config.needPhone = doRequire;
    return this;
  }

  /**
   * Генерирует HTML на основе заданных параметров
   * @return {string}
   */
  buildHtml(): string {
    return new FormBuilder(
      "https://yoomoney.ru/quickpay/confirm.xml",
      "POST",
      convert(this.config)
    ).buildHtml();
  }
}
