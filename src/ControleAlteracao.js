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

            this.iniciar(event.target, editorCtrl);
        }, true);

        editorCtrl.registrarEventListener('blur', event => {
            this._comFoco = false;

            this.finalizar(event.target, editorCtrl);
            this.comprometer();
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

    comprometer() {
        if (this.alterado) {
            this.alterado = false;
            this._editorCtrl.dispatchEvent(new ArticulacaoChangeEvent(this._editorCtrl));
        }
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

        if (!this._alterado && !this._conectado && this._comFoco) {
            this.iniciar(this._editorCtrl._elemento, this._editorCtrl);
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
     * 
     * @param {Element} elemento
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação 
     */
    iniciar(elemento, editorCtrl) {
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
     * 
     * @param {Element} elemento 
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    finalizar(elemento, editorCtrl) {
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
    constructor(editorCtrl) {
        super(editorCtrl);

        this._alteradoCache = false;
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
     * 
     * @param {Element} elemento 
     * @param {EditorArticulacaoController} editorCtrl Editor de articulação
     */
    iniciar(elemento, editorCtrl) {
        this._lexml = editorCtrl.lexmlString;
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