import os
import sys
import tempfile
import shutil
import asyncio
from flask import Blueprint, request, jsonify, send_file
from flask_cors import cross_origin

# Adicionar o diretório raiz do scribd-dl ao path
scribd_dl_path = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, scribd_dl_path)

download_bp = Blueprint('download', __name__)

@download_bp.route('/download', methods=['POST'])
@cross_origin()
def download_document():
    try:
        data = request.get_json()
        url = data.get('url')
        download_type = data.get('type', 'default')  # 'default' ou 'image'
        
        if not url:
            return jsonify({'error': 'URL é obrigatória'}), 400
        
        # Validar se é uma URL do Scribd
        if 'scribd.com' not in url:
            return jsonify({'error': 'URL deve ser do Scribd'}), 400
        
        # Determinar o flag baseado no tipo
        flag = '/i' if download_type == 'image' else None
        
        # Criar diretório temporário para o download
        temp_dir = tempfile.mkdtemp()
        
        try:
            # Executar o download usando subprocess para chamar o script Node.js
            import subprocess
            
            # Construir comando
            cmd = ['node', 'run.js']
            if flag:
                cmd.append(flag)
            cmd.append(url)
            
            # Executar no diretório do scribd-dl
            result = subprocess.run(
                cmd,
                cwd=scribd_dl_path,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos timeout
            )
            
            if result.returncode == 0:
                # Procurar pelo arquivo PDF gerado
                pdf_files = []
                for root, dirs, files in os.walk(scribd_dl_path):
                    for file in files:
                        if file.endswith('.pdf'):
                            pdf_files.append(os.path.join(root, file))
                
                if pdf_files:
                    # Pegar o arquivo mais recente
                    latest_file = max(pdf_files, key=os.path.getctime)
                    filename = os.path.basename(latest_file)
                    
                    return send_file(
                        latest_file,
                        as_attachment=True,
                        download_name=filename,
                        mimetype='application/pdf'
                    )
                else:
                    return jsonify({'error': 'Nenhum arquivo PDF foi gerado'}), 500
            else:
                error_msg = result.stderr or result.stdout or 'Erro desconhecido'
                return jsonify({'error': f'Falha no download: {error_msg}'}), 500
                
        except subprocess.TimeoutExpired:
            return jsonify({'error': 'Timeout: Download demorou muito para completar'}), 500
        except Exception as e:
            return jsonify({'error': f'Erro durante o download: {str(e)}'}), 500
        finally:
            # Limpar diretório temporário
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@download_bp.route('/status', methods=['GET'])
@cross_origin()
def status():
    return jsonify({'status': 'API funcionando', 'version': '1.0.0'})

