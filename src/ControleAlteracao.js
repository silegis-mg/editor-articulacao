import ArticulacaoChangeEvent from './eventos/ArticulacaoChangeEvent';

/**
 * Monitora alterações no editor de articulação e dispara o evento chagne.
 * 
 * @author Júlio César e Melo
 */
class ControleAlteracao {
    constructor(editorCtrl) {
        this.alterado = false;

        editorCtrl.registrarEventListener('focus', event => {
            if (!this.alterado) {
                this.iniciar(event.target, editorCtrl);
            }
        }, true);

        editorCtrl.registrarEventListener('blur', event => {
            this.finalizar(event.target, editorCtrl);

            if (this.alterado) {
                this.alterado = false;
                editorCtrl.dispatchEvent(new ArticulacaoChangeEvent(editorCtrl));
            }
        }, true);
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

        this._editorCtrl = editorCtrl;
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