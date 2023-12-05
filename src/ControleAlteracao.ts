/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Editor-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

import EditorArticulacaoController from './EditorArticulacaoController';
import ArticulacaoChangeEvent from './eventos/ArticulacaoChangeEvent';

/**
 * Monitora alterações no editor de articulação e dispara o evento change.
 */
export abstract class ControleAlteracao {
    protected readonly _editorCtrl: EditorArticulacaoController;
    protected _comFoco: boolean;

    constructor(editorCtrl: EditorArticulacaoController) {
        this._editorCtrl = editorCtrl;
        this._comFoco = this._editorCtrl.isFocused();

        editorCtrl.registrarEventListener('focus', event => {
            this._comFoco = true;

            this.iniciar(event.target as Element, editorCtrl);
        }, true);

        editorCtrl.registrarEventListener('blur', event => {
            this._comFoco = false;

            this.finalizar(event.target as Element, editorCtrl);
            this.comprometer();
        }, true);
    }

    abstract get alterado(): boolean;

    abstract set alterado(valor: boolean);

    /**
     * Inicia a monitoração de alterações.
     * 
     * @param elemento
     * @param editorCtrl Editor de articulação
     */
    abstract iniciar(elemento: Element, editorCtrl: EditorArticulacaoController): void;

    /**
     * Finaliza a monitoração de alterações.
     * 
     * @param elemento 
     * @param editorCtrl Editor de articulação
     */
    abstract finalizar(elemento: Element, editorCtrl: EditorArticulacaoController): void;

    comprometer() {
        if (this.alterado) {
            this.alterado = false;
            this._editorCtrl.dispatchEvent(new ArticulacaoChangeEvent());
        }
    }
}

/**
 * Monitora as alterações utilizando MutationObserver.
 */
class ControleAlteracaoMutationObserver extends ControleAlteracao {

    private readonly _observer: MutationObserver;
    private _iniciado = false;
    private _alterado = false;
    private _conectado = false;

    constructor(editorCtrl: EditorArticulacaoController) {
        super(editorCtrl);

        this._observer = new MutationObserver(this._mutationCallback.bind(this));
    }

    get alterado() {
        return this._alterado;
    }

    set alterado(valor) {
        this._alterado = valor;

        if (!this._alterado && !this._conectado && this._comFoco) {
            this.iniciar(this._editorCtrl._elemento);
        }

        if (this._alterado && !this._comFoco) {
            this.comprometer();
        }

        if (this._alterado) {
            this.finalizar();
        }
    }

    /**
     * Inicia a monitoração de alterações.
     */
    iniciar(elemento: Element) {
        if (!this._conectado) {
            this._observer.observe(elemento, {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
            this._conectado = true;
        }
        this._iniciado = true;
    }

    /**
     * Finaliza a monitoração de alterações.
     */
    finalizar() {
        if (this._conectado) {
            this._observer.disconnect();
            this._conectado = false;
        }

        this._iniciado = false;
    }

    _mutationCallback() {
        try {
            this._conectado = false;
            this._observer.disconnect();
        } finally {
            this.alterado = true;
        }
    }
}

/**
 * Monitora as alterações comparando o lexml no foco e no blur.
 */
class ControleAlteracaoComparativo extends ControleAlteracao {

    private _alteradoCache = false;
    private _lexml?: string;

    constructor(editorCtrl: EditorArticulacaoController) {
        super(editorCtrl);
    }

    get alterado() {
        if (this._alteradoCache) {
            return true;
        } else {
            this._alteradoCache = this._editorCtrl.lexmlString !== this._lexml;
            return this._alteradoCache;
        }
    }

    set alterado(valor) {
        this._lexml = valor ? '' : this._editorCtrl.lexmlString;
        this._alteradoCache = !!valor;

        if (valor && !this._comFoco) {
            this.comprometer();
        }
    }

    /**
     * Inicia a monitoração de alterações.
     */
    iniciar(elemento: Element, editorCtrl: EditorArticulacaoController) {
        this._lexml = editorCtrl.lexmlString;
    }

    /**
     * Finaliza a monitoração de alterações.
     */
    finalizar() {
    }
}

export function criarControleAlteracao(editorCtrl: EditorArticulacaoController) {
    if ('MutationObserver' in window) {
        return new ControleAlteracaoMutationObserver(editorCtrl);
    } else {
        return new ControleAlteracaoComparativo(editorCtrl);
    }
}
