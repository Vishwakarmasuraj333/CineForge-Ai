.PHONY: help install-backend install-frontend install dev dev-backend dev-frontend test test-backend test-frontend build lint clean

help:
	@echo "CineForge AI - Commands:"
	@echo "  make install         Install backend and frontend dependencies"
	@echo "  make dev             Start full development environment"
	@echo "  make test            Run all backend and frontend tests"
	@echo "  make lint            Run code linters and formatters"
	@echo "  make build           Build production frontend and containers"

install-backend:
	cd backend && python -m pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

dev-frontend:
	cd frontend && npm run dev

test-backend:
	cd backend && pytest -v

test-frontend:
	cd frontend && npm test

test: test-backend test-frontend

lint:
	cd backend && ruff check .
	cd frontend && npm run lint

build:
	cd frontend && npm run build

