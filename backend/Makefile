.PHONY: dev test doc

dev:
	python run_server.py

# 用默认浏览器打开文档页面
	
doc:
	@echo "Opening http://0.0.0.0:8000/docs ..."
	@python -c "import webbrowser; webbrowser.open('http://0.0.0.0:8000/docs')"

test:
	pytest -q