import ArticulacaoChangeEvent from './eventos/ArticulacaoChangeEvent';

/**
 * Monitora alterações no editor de articulação e dispara o evento chagne.
 * 
 * @author Júlio César e Melo
 */
class ControleAlteracao {
    constructor(editorCtrl) {
        this._editorCtrl = editorCtrl;

        editorCtrl.registrarEventListener('focus', event => {
            this._comFoco = true;

            if (!this.alterado) {
                this.iniciar(event.target, editorCtrl);
            }
        }, true);

        editorCtrl.registrarEventListener('blur', event => {
            this._comFoco = false;

            this.finalizar(event.target, editorCtrl);

            if (this.alterado) {
                editorCtrl.dispatchEvent(new ArticulacaoChangeEvent(editorCtrl));
                this.alterado = false;
            }
        }, true);
    }

    get alterado() {
        throw 'Não implementado.';
    }

    set alterado(valor) {
        throw 'Não implementado.';
    }

    /**
     * Inicia a monitoração de alterações.
     * 
     * @param {Element} elemento
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    iniciar(elemento, editorCtrl) {
        throw 'Não implementado';
    }

    /**
     * Finaliza a monitoração de alterações.
     * 
     * @param {Element} elemento 
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    finalizar(elemento, editorCtrl) {
        throw 'Não implementado';
    }
}

/**
 * Monitora as alterações utilizando MutationObserver.
 * 
 * @author Júlio César e Melo
 */
class ControleAlteracaoMutationObserver extends ControleAlteracao {
    constructor(editorCtrl) {
        super(editorCtrl);

        this._observer = new MutationObserver(this._mutationCallback.bind(this));
        this._iniciado = false;
        this._alterado = false;
    }

    get alterado() {
        return this._alterado;
    }

    set alterado(valor) {
        this._alterado = valor;

        if (!valor && !this._conectado && this._iniciado) {
            this.iniciar(this._editorCtrl._elemento, editorCtrl);
        }

        if (valor && !this._comFoco) {
            this._editorCtrl.dispatchEvent(new ArticulacaoChangeEvent(this._editorCtrl));
        }
    }

    /**
     * Inicia a monitoração de alterações.
     * 
     * @param {Element} elemento
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação 
     */
    iniciar(elemento, editorCtrl) {
        this._observer.observe(elemento, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
        this._conectado = true;
        this._iniciado = true;
    }

    /**
     * Finaliza a monitoração de alterações.
     * 
     * @param {Element} elemento 
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    finalizar(elemento, editorCtrl) {
        if (this._conectado) {
            this._observer.disconnect();
        }

        this._iniciado = false;
    }

    _mutationCallback() {
        this.alterado = true;
        this._observer.disconnect();
        this._conectado = false;
    }
}

/**
 * Monitora as alterações comparando o lexml no foco e no blur.
 */
class ControleAlteracaoComparativo extends ControleAlteracao {
    constructor(editorCtrl) {
        super(editorCtrl);

        this._alteradoCache = false;
    }

    get alterado() {
        if (this._alteradoCache) {
            return true;
        } else {
            this._alteradoCache = this._lexml && this._editorCtrl.lexml.outerHTML !== this._lexml;
            return this._alteradoCache;
        }
    }

    set alterado(valor) {
        this._lexml = !!valor;
        this._alteradoCache = !!valor;

        if (valor && !this._comFoco) {
            this._editorCtrl.dispatchEvent(new ArticulacaoChangeEvent(this._editorCtrl));
        }
    }

     /**
     * Inicia a monitoração de alterações.
     * 
     * @param {Element} elemento 
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    iniciar(elemento, editorCtrl) {
        this._lexml = editorCtrl.lexml.outerHTML;
    }

    /**
     * Finaliza a monitoração de alterações.
     * 
     * @param {Element} elemento
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    finalizar(elemento, editorCtrl) {
    }
}

function criarControleAlteracao(editorCtrl) {
    if ('MutationObserver' in window) {
        return new ControleAlteracaoMutationObserver(editorCtrl);
    } else {
        return new ControleAlteracaoComparativo(editorCtrl);
    }
}

export default criarControleAlteracao;