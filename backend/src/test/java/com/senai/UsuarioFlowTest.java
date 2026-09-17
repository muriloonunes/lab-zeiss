package com.senai;

import com.senai.auth.dto.LoginRequest;
import com.senai.usuario.TipoUsuario;
import com.senai.usuario.dto.AlterarSenhaRequest;
import com.senai.usuario.dto.AtualizarUsuarioRequest;
import com.senai.usuario.dto.CriarUsuarioRequest;
import com.senai.usuario.dto.RedefinirSenhaRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class UsuarioFlowTest
 */
@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsuarioFlowTest {
    private static final String COOKIE_NAME = "jwt-token";

    private String realizarLogin(String login, String senha) {
        Response response = given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest(login, senha))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(204)
                .cookie(COOKIE_NAME, notNullValue())
                .extract()
                .response();

        return response.getCookie(COOKIE_NAME);
    }

    @Test
    @Order(1)
    public void testLoginAdminInicialComUsernameESenha() {
        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("admin", "reputation"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(204)
                .cookie(COOKIE_NAME, notNullValue());
    }

    @Test
    @Order(2)
    public void testLoginAdminInicialComEmailESenha() {
        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("admin@admin.com", "reputation"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(204)
                .cookie(COOKIE_NAME, notNullValue());
    }

    @Test
    @Order(3)
    public void testLoginComCredenciaisInvalidas() {
        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("admin", "invalid"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(401);
    }

    @Test
    @Order(4)
    public void testCriarUsuarioComoAdmin() {
        var adminCookie = realizarLogin("admin", "reputation");
        var request = new CriarUsuarioRequest(
                "Tecnico Jooj",
                "tecnico",
                "tecnico@senai.com",
                "senha1234",
                TipoUsuario.TECNICO
        );
        given()
                .contentType(ContentType.JSON)
                .cookie(COOKIE_NAME, adminCookie)
                .body(request)
                .when()
                .post("/api/usuarios")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("username", equalTo("tecnico"))
                .body("email", equalTo("tecnico@senai.com"))
                .body("tipoUsuario", equalTo("TECNICO"))
                .body("ativo", equalTo(true));
    }

    @Test
    @Order(5)
    public void testCriarUsuarioDuplicado() {
        var adminCookie = realizarLogin("admin", "reputation");
        var duplicado = new CriarUsuarioRequest(
                "Tecnico Jooj",
                "tecnico",
                "outro@senai.com",
                "senha1234",
                TipoUsuario.TECNICO
        );

        given()
                .cookie(COOKIE_NAME, adminCookie)
                .contentType(ContentType.JSON)
                .body(duplicado)
                .when()
                .post("/api/usuarios")
                .then()
                .statusCode(409);
    }

    @Test
    @Order(6)
    public void testAcessoNaoAutorizado() {
        given()
                .when()
                .get("/api/usuarios")
                .then()
                .statusCode(401);
    }

    @Test
    @Order(7)
    public void testAcessoNaoAutorizadoLogado() {
        var tecnicoCookie = realizarLogin("tecnico", "senha1234");

        given()
                .cookie(COOKIE_NAME, tecnicoCookie)
                .when()
                .get("/api/usuarios")
                .then()
                .statusCode(403);
    }

    @Test
    @Order(8)
    public void testUsuarioAlteraPropriaSenhaELogaComNovaSenha() {
        String tecnicoCookie = realizarLogin("tecnico", "senha1234");

        // erro se errar a senha atual
        given()
                .cookie(COOKIE_NAME, tecnicoCookie)
                .contentType(ContentType.JSON)
                .body(new AlterarSenhaRequest("senha_errada", "novaSenha123"))
                .when()
                .put("/api/usuarios/me/senha")
                .then()
                .statusCode(401);

        // sucesso ao alterar com a senha atual correta
        given()
                .cookie(COOKIE_NAME, tecnicoCookie)
                .contentType(ContentType.JSON)
                .body(new AlterarSenhaRequest("senha1234", "novaSenha123"))
                .when()
                .put("/api/usuarios/me/senha")
                .then()
                .statusCode(204);

        // login com a senha antiga (deve falhar)
        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("tecnico", "senha1234"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(401);

        // login com a NOVA senha (deve ter sucesso)
        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("tecnico", "novaSenha123"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(204);
    }

    @Test
    @Order(9)
    public void testAdminRedefinirSenhaDeOutroUsuario() {
        String adminCookie = realizarLogin("admin", "reputation");

        // Admin força a redefinição de senha do usuário ID 2 (tecnico1)
        given()
                .cookie(COOKIE_NAME, adminCookie)
                .contentType(ContentType.JSON)
                .body(new RedefinirSenhaRequest("senhaForcadaAdmin123"))
                .when()
                .put("/api/usuarios/2/senha")
                .then()
                .statusCode(204);

        // Técnico consegue logar com a nova senha definida pelo Admin
        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("tecnico", "senhaForcadaAdmin123"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(204);
    }

    @Test
    @Order(10)
    public void testAdminNaoPodeRebaixarOUltimoAdminAtivoRetorna409() {
        String adminCookie = realizarLogin("admin", "reputation");

        var request = new AtualizarUsuarioRequest(
                "Administrador",
                "admin",
                "admin@admin.com",
                TipoUsuario.TECNICO
        );

        given()
                .cookie(COOKIE_NAME, adminCookie)
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .put("/api/usuarios/1")
                .then()
                .statusCode(409);
    }

    @Test
    @Order(11)
    public void testAdminDesativaUsuario() {
        String adminCookie = realizarLogin("admin", "reputation");

        given()
                .cookie(COOKIE_NAME, adminCookie)
                .when()
                .delete("/api/usuarios/2")
                .then()
                .statusCode(204);

        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("tecnico", "senhaForcadaAdmin123"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(401);
    }

    @Test
    @Order(12)
    public void testAdminReativaUsuario() {
        String adminCookie = realizarLogin("admin", "reputation");

        given()
                .cookie(COOKIE_NAME, adminCookie)
                .when()
                .put("/api/usuarios/2/reativar")
                .then()
                .statusCode(204);

        given()
                .contentType(ContentType.JSON)
                .body(new LoginRequest("tecnico", "senhaForcadaAdmin123"))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(204);
    }
}
