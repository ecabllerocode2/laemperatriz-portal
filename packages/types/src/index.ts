import type { Timestamp } from "firebase/firestore";

// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "seller" | "client";

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserStatus = "pending" | "active" | "disabled";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole | null;  // null = pending approval
  status: UserStatus;
  whatsapp?: string;
  /** Vinculación con registro CRM — solo cuando role === "client". */
  customerId?: string;
  fcmTokens: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export type CustomerStatus = "vip" | "regular" | "at_risk" | "inactive" | "new";

/**
 * Business classification (distinct from the recency `status` semaphore).
 * - `new`: aún no completa su primer ciclo / no acumula el umbral.
 * - `frequent`: ya superó el umbral o pagó su envío de penalización.
 */
export type CustomerTier = "new" | "frequent";

export interface Customer {
  id: string;
  name: string;
  /** Format: +521XXXXXXXXXX (E.164). Unique identifier. */
  whatsapp: string;
  /** Correo de acceso al portal (opcional hasta activar cuenta). */
  email?: string;
  /** UID de Firebase Auth vinculado al portal. */
  authUid?: string;
  status: CustomerStatus;
  /** Clasificación de negocio para el flujo de Lives. */
  tier: CustomerTier;
  /** Ciclo de compras abierto actualmente (si existe). */
  activeCycleId?: string;
  lastPurchaseAt?: Timestamp;
  totalSpent: number;
  birthday?: string; // ISO YYYY-MM-DD
  shippingAddress?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  createdAt: Timestamp;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  key: string;
  order: number;
}

/** Valor por defecto cuando color/talla no aplican al producto. */
export const VARIANT_NOT_APPLICABLE = "No aplica";

/** Variante de inventario (color, talla, stock propio). */
export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  /** Format: EMP-[CAT3]-[0000] */
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  images: ProductImage[];
  /** Visible only for admin role */
  cost: number;
  price: number;
  /** Total de piezas (suma de variantes). */
  stock: number;
  /** Variantes con color/talla; si falta, se asume una sola variante "No aplica". */
  variants?: ProductVariant[];
  stockAlertThreshold: number;
  /** Color de nota fijado al dar de alta el producto en inventario. */
  saleChannel: ProductSaleChannel;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Sales Note ───────────────────────────────────────────────────────────────

/**
 * Color de nota asignado al producto en inventario:
 * - `whatsapp` (verde) y `facebook` (azul): elegibles para descuento de pronto pago.
 * - `no_discount` (naranja): nunca recibe descuento de pronto pago.
 */
export type ProductSaleChannel = "whatsapp" | "facebook" | "no_discount";

/** Origen de la venta dentro del portal (live vs tienda en línea). */
export type SaleOrigin = "live" | "store";

/** Canal de una nota; `mixed` cuando agrupa productos de distintos colores. */
export type SaleChannel = ProductSaleChannel | "mixed";

/**
 * Estado de pago de la nota/ticket diario dentro de un ciclo.
 * - `pending_payment`: ticket generado, corre el temporizador de 24h.
 * - `paid_early`: pagada dentro de 24h con descuento de pronto pago aplicado.
 * - `paid_late`: pagada fuera de 24h (o canal naranja) sin descuento.
 * - `cancelled`: nota cancelada, stock devuelto.
 */
export type SaleNoteStatus = "pending_payment" | "paid_early" | "paid_late" | "cancelled";

export interface SaleNoteItem {
  productId: string;
  sku: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  /** Snapshot del color del producto al momento de la venta. */
  channel?: ProductSaleChannel;
  /** Variante vendida (color/talla de joyería). */
  variantId?: string;
  variantColor?: string;
  variantSize?: string;
  /** Dónde se apartó la pieza: transmisión en vivo o tienda en línea. */
  saleOrigin?: SaleOrigin;
}

/**
 * Registro de un pago (parcial o total) sobre una nota.
 */
export interface NotePayment {
  id: string;
  amount: number;
  paidAt: Timestamp;
  /** Notas opcionales del admin sobre este pago. */
  note?: string;
}

export interface SaleNote {
  id: string;
  customerId: string;
  /** Ciclo de compras al que pertenece esta nota. */
  cycleId: string;
  /** Color de la nota; `mixed` si los ítems tienen distintos colores. */
  channel: SaleChannel;
  items: SaleNoteItem[];
  subtotal: number;
  /** ¿La nota puede recibir descuento de pronto pago? (false si canal naranja) */
  earlyPayEligible: boolean;
  /** Límite para pagar y conservar el descuento de pronto pago. */
  earlyPayDeadline?: Timestamp;
  /** Porcentaje de descuento de pronto pago efectivamente aplicado (0 si no aplica). */
  earlyPayDiscountPercent: number;
  /** Descuento monetario aplicado. */
  discount: number;
  /** Total a pagar (subtotal - discount). */
  total: number;
  status: SaleNoteStatus;
  /** Historial de pagos parciales o totales recibidos. */
  payments: NotePayment[];
  /** Suma de todos los pagos recibidos hasta ahora. */
  paidAmount: number;
  /**
   * Si es la primera nota del ciclo, el depósito inicial se acredita aquí.
   * Este valor ya fue contado en cycle.netAccumulated al confirmar el depósito,
   * por lo que no se vuelve a sumar al cerrar la nota.
   */
  depositCredit?: number;
  deliveryNotes?: string;
  /** Timestamp del último pago que liquidó la nota. */
  paidAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Cycle (ciclo de compras de 7 días) ─────────────────────────────────────────

/**
 * Estados del ciclo de venta por Lives. Ver máquina de estados en el SDD/flujo.
 */
/**
 * Un item de mercancía dentro del cálculo de penalización frecuente.
 * Puede ser una fracción (cantidad parcial) del item original de la nota.
 */
export interface PenaltyItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  /** ID de la nota de origen (para referencia). */
  noteId: string;
}

export type CycleStatus =
  | "awaiting_deposit" // esperando confirmación del depósito de $200
  | "deposit_confirmed" // depósito ok; ventana inicia en la primera nota
  | "active"           // carrito activo, ventana de 7 días corriendo
  | "closing_new"      // día 7, cliente Nueva: se evalúa el umbral
  | "penalty_new"      // Nueva que no acumuló: debe pagar envío de penalización
  | "closing_freq"     // día 7, cliente Frecuente: se aplica tabulación, plazo día 8
  | "penalty_freq"     // Frecuente que no liquidó al día 8: ajuste -30%
  | "settled"          // liquidado correctamente
  | "restocked"        // mercancía devuelta a disponible (Nueva que no pagó)
  | "forfeited";       // mercancía liberada + depósito retenido por la empresa

export type CycleOutcome = "upgraded" | "settled" | "restocked" | "forfeited";

export interface Cycle {
  id: string;
  customerId: string;
  /** Datos denormalizados para el panel de tareas y links de WhatsApp. */
  customerName: string;
  customerWhatsapp: string;
  /** Tier del cliente al abrir el ciclo. */
  tier: CustomerTier;
  status: CycleStatus;
  depositAmount: number;
  depositConfirmedAt?: Timestamp;
  opensAt?: Timestamp;
  /** opensAt + purchaseWindowDays (fin de la ventana de compra). */
  purchaseWindowEndsAt?: Timestamp;
  /** Frecuente: purchaseWindowEndsAt + 24h (octavo día). */
  settlementDueAt?: Timestamp;
  noteIds: string[];
  /** Suma de los totales de notas pagadas en el ciclo. */
  grossAccumulated: number;
  /** Acumulado neto que cuenta para el umbral (incluye el depósito). */
  netAccumulated: number;
  freeShippingEarned: boolean;
  shippingCost: number;
  penaltyApplied?: boolean;
  penaltyPercent?: number;
  /** Costo de envío de penalización descontado en mercancía. */
  penaltyShipping?: number;
  /** Total monetario que corresponde a la mercancía que SÍ se envía. */
  adjustedTotal?: number;
  /**
   * Items que SÍ se envían a la clienta (los más antiguos que caben dentro del
   * monto ajustado). Guardados para la confirmación y para la exportación.
   */
  penaltyKeptItems?: PenaltyItem[];
  /**
   * Items que REGRESAN al stock (los más recientes / el excedente).
   * Se restockean solo cuando la clienta aprueba.
   */
  penaltyReturnedItems?: PenaltyItem[];
  penaltyDecision?: "pending" | "accepted" | "rejected";
  outcome?: CycleOutcome;
  closedAt?: Timestamp;
  /** Estado del envío físico (solo para ciclos liquidados). */
  shippingStatus?: "preparing" | "shipped" | "delivered";
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  /** Nota libre del admin sobre el envío (número de guía, transportista, etc.). */
  trackingNote?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Customer Action ──────────────────────────────────────────────────────────

export type ActionType =
  | "collection_reminder"
  | "shipping_confirmation"
  | "delivery_followup"
  | "reactivation"
  | "satisfaction_followup";

export interface CustomerAction {
  id: string;
  customerId: string;
  saleNoteId?: string;
  actionType: ActionType;
  aiMessage?: string;
  performedAt: Timestamp;
  performedBy: string;
  nextActionAt?: Timestamp;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "low_stock"
  | "new_sale"
  | "payment_received"
  | "action_reminder";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  relatedId?: string;
  createdAt: Timestamp;
}

// ─── Business Rules (configurables por el admin) ───────────────────────────────

export interface ShippingTier {
  /** Total mínimo del ciclo (inclusive). */
  minTotal: number;
  /** Total máximo del ciclo (inclusive). Usa null para "sin límite". */
  maxTotal: number | null;
  /** Costo de envío para ese rango. */
  cost: number;
}

export interface BusinessRules {
  /** Depósito requerido para activar el carrito (por ciclo). */
  depositAmount: number;
  /** % de descuento de pronto pago (pago dentro de la ventana). */
  earlyPayDiscountPercent: number;
  /** Ventana de pronto pago en horas (24 por defecto). */
  earlyPayWindowHours: number;
  /** Duración de la ventana de compra del ciclo en días (7 por defecto). */
  purchaseWindowDays: number;
  /** Umbral neto para que una cliente Nueva suba a Frecuente + envío gratis. */
  newTierThreshold: number;
  /** Costo de envío de penalización para Nueva que no alcanza el umbral. */
  newTierPenaltyShipping: number;
  /** % de descuento sobre mercancía antigua si Frecuente no liquida al día 8. */
  frequentLatePenaltyPercent: number;
  /** Costo de envío de penalización que se descuenta en mercancía (no en dinero). */
  frequentPenaltyShipping: number;
  /** Tabulación de envíos para clientes Frecuentes (por rango de total). */
  shippingTab: ShippingTier[];
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// ─── Task (panel de tareas accionables) ─────────────────────────────────────────

export type TaskType =
  | "confirm_deposit"      // confirmar depósito para activar carrito
  | "collect_early_pay"    // cobrar nota antes de que venza el pronto pago
  | "close_cycle"          // cerrar ciclo (venció la ventana de 7 días)
  | "collect_penalty_ship" // Nueva: cobrar envío $150 o devolver stock
  | "settle_freq"          // Frecuente: cobrar saldo + envío (día 8)
  | "resolve_penalty_freq"; // Frecuente: aprobar ajuste -30% o decomisar

export type TaskPriority = "urgent" | "soon" | "normal";

export interface Task {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  cycleId?: string;
  saleNoteId?: string;
  /** Marca de tiempo (ms epoch) del vencimiento, para ordenar por urgencia. */
  dueAt?: number;
  /** Texto humano del vencimiento (ej. "vence en 3h"). */
  dueLabel?: string;
  /** Datos auxiliares para la UI (montos, acumulado, etc.). */
  meta?: Record<string, number | string | boolean>;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole | null;  // null = pending (no role assigned yet)
  name: string;
  customerId?: string;
}

// ─── Portal (respuestas sanitizadas para clientes) ────────────────────────────

/** Perfil visible para la clienta en el portal. */
export interface PortalProfile {
  id: string;
  name: string;
  whatsapp: string;
  tier: CustomerTier;
  status: CustomerStatus;
  totalSpent: number;
  lastPurchaseAt?: Timestamp;
}

/** Nota de venta sin campos internos de staff. */
export interface PortalSaleNote {
  id: string;
  cycleId: string;
  channel: SaleChannel;
  items: SaleNoteItem[];
  subtotal: number;
  earlyPayEligible: boolean;
  earlyPayDeadline?: Timestamp;
  earlyPayDiscountPercent: number;
  discount: number;
  total: number;
  status: SaleNoteStatus;
  paidAmount: number;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  /** ms restantes para pronto pago (0 si vencido o no aplica). */
  earlyPayRemainingMs?: number;
  /** true cuando el live terminó y ya corre el timer de 24h. */
  earlyPayTimerStarted?: boolean;
  /** Subtotal de ítems azul/verde sobre el que aplica el descuento. */
  earlyPayEligibleSubtotal?: number;
  /** true cuando el descuento de pronto pago está activo ahora mismo. */
  earlyPayActive?: boolean;
}

/** Aviso de liquidación (notas o envío) en el portal. */
export interface PortalLiquidationAlert {
  id: string;
  message: string;
  severity: "info" | "warning" | "urgent";
  remainingMs?: number;
}

/** Paso del rastreo de envío en el portal. */
export interface ShippingProgressStep {
  id: "packing" | "shipped" | "delivered";
  label: string;
  done: boolean;
  active: boolean;
}

/** Resumen de envío del ciclo para la pantalla Mis envíos. */
export interface PortalShipmentSummary {
  shipmentNumber: number;
  cycleDay: number;
  cycleDayTotal: number;
  openedAtMs?: number;
  closedAtMs?: number;
  statusLabel: string;
  statusTone: "open" | "closing" | "settled" | "penalty";
  accumulatedTotal: number;
  paidMerchandise: number;
  projectedShippingCost: number;
  shippingFree: boolean;
  shippingLabel: string;
  purchaseCount: number;
  pendingNotesCount: number;
  pendingNotesTotal: number;
  canPayShipping: boolean;
  canConfirmFreeShipping: boolean;
  canPayNotes: boolean;
  purchaseWindowRemainingMs: number;
  settlementRemainingMs: number;
  shippingTab: ShippingTier[];
  shippingProgress: ShippingProgressStep[];
  liquidationAlerts: PortalLiquidationAlert[];
}

export interface PortalShipmentListItem {
  cycleId: string;
  isActive: boolean;
  cycle: PortalCycle;
}

export interface PortalShipmentsResponse {
  active: PortalCycle | null;
  history: PortalShipmentListItem[];
  needsShippingAddress: boolean;
  shippingAddress: string | null;
  shippingAddressDetail?: Record<string, unknown> | null;
}

export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt?: string;
}

export interface PortalPenaltySummary {
  decision: "pending" | "accepted" | "rejected";
  grossMerchandise: number;
  keepBudget: number;
  adjustedTotal: number;
  removedValue: number;
  penaltyPercent: number;
  penaltyShipping: number;
  keptItems: PenaltyItem[];
  returnedItems: PenaltyItem[];
}

/** Ciclo visible para la clienta. */
export interface PortalCycle {
  id: string;
  tier: CustomerTier;
  status: CycleStatus;
  depositAmount: number;
  depositConfirmedAt?: Timestamp;
  opensAt?: Timestamp;
  purchaseWindowEndsAt?: Timestamp;
  settlementDueAt?: Timestamp;
  grossAccumulated: number;
  netAccumulated: number;
  freeShippingEarned: boolean;
  shippingCost: number;
  shippingStatus?: Cycle["shippingStatus"];
  /** ms restantes de la ventana de compra. */
  purchaseWindowRemainingMs?: number;
  /** ms restantes para liquidación (frecuente, día 8). */
  settlementRemainingMs?: number;
  notes: PortalSaleNote[];
  penalty?: PortalPenaltySummary | null;
  /** Datos enriquecidos para Mis envíos (proyección, tabulación, avisos). */
  shipment?: PortalShipmentSummary;
}

export interface PortalNotesPage {
  notes: PortalSaleNote[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Comentario efímero en el chat del live (Realtime Database). */
export interface LiveChatComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

/** Producto destacado en el live del portal. */
export interface PortalFeaturedProduct {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  /** Todas las imágenes del producto (orden de inventario). */
  imageUrls: string[];
  shownAt: string | null;
  saleChannel: ProductSaleChannel;
  /** % de pronto pago si el producto es elegible (0 si naranja). */
  earlyPayDiscountPercent: number;
  /** Variantes disponibles al mostrar (stock por color/talla). */
  variants?: ProductVariant[];
}

/** Producto listado en la tienda en línea del portal. */
export interface PortalStoreProduct {
  productId: string;
  name: string;
  description?: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  imageUrls: string[];
  saleChannel: ProductSaleChannel;
  earlyPayDiscountPercent: number;
  variants?: ProductVariant[];
}

export interface PortalStoreProductsResponse {
  products: PortalStoreProduct[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

/** Sesión en vivo activa visible para clientas en el portal. */
export interface PortalLiveSession {
  id: string;
  name: string;
  startedAt: string | null;
  facebookVideoUrl: string | null;
  embedUrl: string | null;
  featuredProduct: PortalFeaturedProduct | null;
  featuredHistory: PortalFeaturedProduct[];
}

export interface PortalLiveResponse {
  session: PortalLiveSession | null;
}

/** Snapshot en RTDB (`livePublic/current`) — push en tiempo real sin polling Firestore. */
export interface LivePublicSnapshot {
  sessionId: string;
  name: string;
  startedAt: string | null;
  facebookVideoUrl: string | null;
  embedUrl: string | null;
  featuredProduct: PortalFeaturedProduct | null;
  featuredHistory: PortalFeaturedProduct[];
  version: number;
  updatedAt: number;
}

export interface PortalLiveOrderResult {
  noteId: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  variantId?: string;
  variantColor?: string;
  variantSize?: string;
}

/** Razón por la que la clienta no puede apartar en el live. */
export type PortalBlockReason =
  | "cart_opening_required"
  | "cart_pending_review"
  | "cycle_completed"
  | "cycle_closed"
  | "threshold_block"
  | null;

export interface PortalThresholdBlock {
  active: boolean;
  orderedTotal: number;
  paidTotal: number;
  requiredPaid: number;
  depositDue: number;
}

export type PortalPrivateToastType =
  | "cart_approved"
  | "payment_rejected"
  | "cycle_completed"
  | "can_purchase";

/** Aviso efímero en RTDB (Firestore sigue siendo fuente de verdad). */
export interface PortalPrivateToast {
  id: string;
  type: PortalPrivateToastType;
  message: string;
  dismissible: boolean;
}

/** Snapshot en RTDB (`portalPrivate/{uid}`) — espejo en tiempo real del estado en Firestore. */
export interface PortalPrivateSnapshot {
  depositStatus: "none" | "pending" | "approved";
  cycleId: string | null;
  cycleStatus: string | null;
  canPurchase: boolean;
  blockReason: PortalBlockReason;
  cartOpeningRequired: boolean;
  pendingPayment: {
    concept: PaymentConcept;
    amount: number;
    status: "pending" | "approved" | "rejected";
  } | null;
  thresholdBlock: PortalThresholdBlock;
  toast: PortalPrivateToast | null;
  version: number;
  updatedAt: number;
}

/** Resumen de pagos pendientes para staff (RTDB `staffPayments/summary`). */
export interface StaffPaymentsSummary {
  pendingCount: number;
  version: number;
  updatedAt: number;
}

export type PaymentConcept = "cart_opening" | "note_payment" | "shipping_payment";

export {
  PERSONAL_DELIVERY_MIN_PURCHASE_MXN,
  normalizePostalCode,
  isPersonalDeliveryPostalCode,
  type FulfillmentDeliveryMethod,
} from "./personal-delivery.js";
export { PERSONAL_DELIVERY_POSTAL_CODES } from "./personal-delivery-postal-codes.js";
