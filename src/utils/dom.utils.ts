/**
 * DOM Utility Functions
 * @module utils/dom
 */

/**
 * Tek bir element seçer (querySelector wrapper)
 * @param selector - CSS selector
 * @returns Element veya null
 */
export function $<T extends Element = Element>(selector: string): T | null {
    return document.querySelector<T>(selector);
}

/**
 * Birden fazla element seçer (querySelectorAll wrapper)
 * @param selector - CSS selector
 * @returns NodeListOf<Element>
 */
export function $$<T extends Element = Element>(selector: string): NodeListOf<T> {
    return document.querySelectorAll<T>(selector);
}

/**
 * ID ile element seçer
 * @param id - Element ID
 * @returns Element veya null
 */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

/**
 * Yeni element oluşturur
 * @param tag - HTML tag adı
 * @param props - Element özellikleri
 * @param children - Child elementler veya text
 * @returns Oluşturulan element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props?: Partial<HTMLElementTagNameMap[K]> & { className?: string; dataset?: Record<string, string> },
    ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (props) {
        const { className, dataset, ...rest } = props;

        if (className) {
            element.className = className;
        }

        if (dataset) {
            Object.entries(dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }

        Object.assign(element, rest);
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Element'e class ekler
 * @param element - Hedef element
 * @param classNames - Eklenecek class isimleri
 */
export function addClass(element: Element | null, ...classNames: string[]): void {
    element?.classList.add(...classNames);
}

/**
 * Element'ten class kaldırır
 * @param element - Hedef element
 * @param classNames - Kaldırılacak class isimleri
 */
export function removeClass(element: Element | null, ...classNames: string[]): void {
    element?.classList.remove(...classNames);
}

/**
 * Element'te class toggle yapar
 * @param element - Hedef element
 * @param className - Toggle edilecek class ismi
 * @param force - Zorunlu state
 */
export function toggleClass(element: Element | null, className: string, force?: boolean): void {
    element?.classList.toggle(className, force);
}

/**
 * Element'in class'ı olup olmadığını kontrol eder
 * @param element - Hedef element
 * @param className - Kontrol edilecek class ismi
 * @returns Class varsa true
 */
export function hasClass(element: Element | null, className: string): boolean {
    return element?.classList.contains(className) ?? false;
}

/**
 * Element'in innerHTML'ini güvenli şekilde set eder
 * @param element - Hedef element
 * @param html - HTML içeriği
 */
export function setHTML(element: Element | null, html: string): void {
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Element'i görünür yapar
 * @param element - Hedef element
 * @param display - Display tipi (varsayılan: 'block')
 */
export function show(element: HTMLElement | null, display: string = 'block'): void {
    if (element) {
        element.style.display = display;
    }
}

/**
 * Element'i gizler
 * @param element - Hedef element
 */
export function hide(element: HTMLElement | null): void {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Event listener ekler
 * @param element - Hedef element
 * @param event - Event tipi
 * @param handler - Event handler
 * @param options - Event listener options
 */
export function on<K extends keyof HTMLElementEventMap>(
    element: Element | null,
    event: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
): void {
    element?.addEventListener(event, handler as EventListener, options);
}

/**
 * Event listener kaldırır
 * @param element - Hedef element
 * @param event - Event tipi
 * @param handler - Event handler
 */
export function off<K extends keyof HTMLElementEventMap>(
    element: Element | null,
    event: K,
    handler: (event: HTMLElementEventMap[K]) => void
): void {
    element?.removeEventListener(event, handler as EventListener);
}
