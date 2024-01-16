/* eslint-disable @typescript-eslint/no-explicit-any */
import { test as base } from '@playwright/test';
import ProblemaValidacao from '../src/validacao/ProblemaValidacao';
import { EditorArticulacaoController } from '../src/editor-articulacao';

interface IFixtures {
    /**
     * Executa a validação de dispositivos.
     * 
     * @param texto Texto a ser validado.
     */
    validar(texto: string): Promise<ProblemaValidacao[]>;

    /**
     * Importa LexML e transforma em HTML do editor de articulação.
     * 
     * @param lexml Articulação no formato do LexML a ser importado.
     * @returns HTML do editor de articulação.
     */
    importarDeLexml(lexml: string): Promise<string>;

    /**
     * Exporta o HTML do editor de articulação para LexML.
     * 
     * @param html HTML do editor de articulaçaõ.
     * @returns LexML.
     */
    exportarParaLexml(html: string): Promise<string>;

    /**
     * Transforma uma entrada da área de transferência em HTML.
     * 
     * @param texto Entrada a ser transformada.
     */
    clipboardTransformar(texto: string): Promise<string>;
}

export const test = base.extend<IFixtures>({
    async page({ page }, use) {
        await page.goto('http://localhost:9000/teste.html');
        await use(page);
    },

    importarDeLexml({ page }, use) {
        use(function (lexml: string) {
            return page.evaluate(articulacao => {
                (globalThis as any).ctrl.lexml = articulacao;
                return document.getElementById('articulacao').innerHTML;
            }, lexml);
        });
    },

    exportarParaLexml({ page }, use) {
        use(function (html: string) {
            return page.evaluate(html => {
                document.getElementById('articulacao').innerHTML = html;
                return ((globalThis as any).ctrl as EditorArticulacaoController).lexmlString;
            }, html);
        });
    },

    validar({ page }, use) {
        use(function (texto: string) {
            return page.evaluate((texto: string) => {
                const ctrl = new ((globalThis as any).window.ValidacaoController)({});

                const dispositivo = document.createElement('p');

                dispositivo.setAttribute('data-tipo', 'artigo');
                dispositivo.textContent = texto;

                return ctrl.validar(dispositivo).map((p: ProblemaValidacao) => p.tipo);
            }, texto);
        });
    },

    clipboardTransformar({ page }, use) {
        use(function (texto: string) {
            return page.evaluate((texto: string) => {
                const fragmento = (globalThis as any).window.clipboardControllerModule.transformar(texto, 'desconhecido');
                const container = document.createElement('div');
                container.append(fragmento);
                return container.innerHTML;
            }, texto);
        });
    }
});

export { expect, Page } from '@playwright/test';