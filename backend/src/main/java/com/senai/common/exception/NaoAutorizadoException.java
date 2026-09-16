package com.senai.common.exception;

public class NaoAutorizadoException extends RuntimeException {
    public NaoAutorizadoException() {
        super("Usuário ou Senha inválidos");
    }
}
