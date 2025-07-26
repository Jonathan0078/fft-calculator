import os
import sys
import tempfile
import shutil
import asyncio
from flask import Blueprint, request, jsonify, send_file
from flask_cors import cross_origin

# Importar o scraper
from src.scribd_scraper import download_scribd_document

download_bp = Blueprint("download", __name__)

@download_bp.route("/download", methods=["POST"])
@cross_origin()
def download_document():
    try:
        data = request.get_json()
        url = data.get("url")
        download_type = data.get("type", "default")  # "default" ou "image"

        if not url:
            return jsonify({"error": "URL é obrigatória"}), 400

        if "scribd.com" not in url:
            return jsonify({"error": "URL deve ser do Scribd"}), 400

        # Criar arquivo temporário para o PDF
        temp_dir = tempfile.mkdtemp()
        temp_pdf_path = os.path.join(temp_dir, "scribd_document.pdf")

        try:
            # Executar o download usando o script Playwright
            print(f"Iniciando download da URL: {url}")
            
            # Executar o download de forma assíncrona
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                success = loop.run_until_complete(
                    download_scribd_document(url, temp_pdf_path, headless=True)
                )
            finally:
                loop.close()

            if success and os.path.exists(temp_pdf_path) and os.path.getsize(temp_pdf_path) > 0:
                # Extrair nome do arquivo da URL ou usar nome padrão
                try:
                    # Tentar extrair o nome do documento da URL
                    url_parts = url.split('/')
                    if len(url_parts) > 4:
                        filename = url_parts[-1].replace('-', '_') + '.pdf'
                    else:
                        filename = 'scribd_document.pdf'
                except:
                    filename = 'scribd_document.pdf'
                
                print(f"Download concluído com sucesso: {temp_pdf_path}")
                
                return send_file(
                    temp_pdf_path,
                    as_attachment=True,
                    download_name=filename,
                    mimetype="application/pdf",
                )
            else:
                error_msg = "Falha no download: Não foi possível gerar o PDF"
                print(error_msg)
                return jsonify({"error": error_msg}), 500

        except Exception as e:
            error_msg = f"Erro durante o download: {str(e)}"
            print(error_msg)
            return jsonify({"error": error_msg}), 500
        finally:
            # Limpar diretório temporário após um delay para permitir o download
            def cleanup_temp_dir():
                try:
                    if os.path.exists(temp_dir):
                        shutil.rmtree(temp_dir)
                except:
                    pass
            
            # Agendar limpeza para depois (o Flask precisa do arquivo para o download)
            import threading
            timer = threading.Timer(60.0, cleanup_temp_dir)  # Limpar após 1 minuto
            timer.start()

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@download_bp.route("/status", methods=["GET"])
@cross_origin()
def status():
    return jsonify({"status": "API funcionando", "version": "2.0.0", "engine": "Playwright"})


