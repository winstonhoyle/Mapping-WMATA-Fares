.PHONY: app-install app-start app-build app-preview app-check app-test \
	py-check colors-check data api-local app-local tf-init tf-plan tf-apply

app/node_modules: app/package-lock.json
	cd app && npm ci
	@touch $@

app-install: app/node_modules

app-start: app/node_modules
	cd app && npm start

app-build: app/node_modules
	cd app && npm run build

app-preview: app-build
	cd app && npm run preview

app-check: app/node_modules
	cd app && npm run lint && npm run format:check && npx tsc -b && npm run test:run

app-test: app/node_modules
	cd app && npm run test:run

.venv/.deps: requirements.txt data/requirements.txt
	test -d .venv || python3 -m venv .venv
	.venv/bin/pip install -q -r requirements.txt -r data/requirements.txt
	@touch $@

py-check: .venv/.deps
	cd lambda && $(CURDIR)/.venv/bin/python -m pytest -q

# Map palettes under protanopia, deuteranopia, and tritanopia (scripts/check_colors.py).
colors-check: .venv/.deps
	.venv/bin/python scripts/check_colors.py

# Pulls stations, lines, and fares from WMATA and Open Data DC, then uploads them to S3.
data: .venv/.deps
	.venv/bin/python data/upload_files.py

# The Lambda's code against local files; data/ needs the JSON from `make data` or S3.
api-local:
	test -f data/fares.json || aws s3 cp s3://wmata-fares/data/ data/ --recursive
	cd lambda && $(CURDIR)/.venv/bin/python local_server.py

app-local: app/node_modules
	cd app && VITE_API_BASE=http://localhost:8000 npm start

tf-init:
	cd infra && terraform init

tf-plan:
	cd infra && terraform plan

tf-apply:
	cd infra && terraform apply
