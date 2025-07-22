# Importa o Flask para criar a aplicação web
from flask import Flask, jsonify

# IMPORTANTE: Importa as funções que já existem no projeto!
# Não precisamos reescrever a lógica, apenas usá-la.
from consultas import consultar_cpf, consultar_cnpj, consultar_placa

# Cria a nossa aplicação Flask
app = Flask(__name__)

# --- Nossas Rotas de API ---

# Rota para a consulta de CPF
# Exemplo de como chamar: /api/cpf/12345678900
@app.route("/api/cpf/<cpf_numero>", methods=["GET"])
def api_cpf(cpf_numero):
    # Chama a função original do arquivo consultas.py
    resultado = consultar_cpf(cpf_numero)
    # Retorna o resultado em formato JSON
    return jsonify(resultado)

# Rota para a consulta de CNPJ
# Exemplo de como chamar: /api/cnpj/00000000000191
@app.route("/api/cnpj/<cnpj_numero>", methods=["GET"])
def api_cnpj(cnpj_numero):
    resultado = consultar_cnpj(cnpj_numero)
    return jsonify(resultado)

# Rota para a consulta de Placa
# Exemplo de como chamar: /api/placa/ABC1234
@app.route("/api/placa/<placa_numero>", methods=["GET"])
def api_placa(placa_numero):
    resultado = consultar_placa(placa_numero)
    return jsonify(resultado)

# Uma rota inicial para testar se a API está no ar
@app.route("/")
def index():
    return "API do MidPainel está funcionando!"
