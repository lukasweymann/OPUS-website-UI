
ifneq ($(wildcard opus-secrets.mk),)
  include opus-secrets.mk
endif

export OPUS_EMAIL_SERVER OPUS_EMAIL_USER OPUS_EMAIL_PASSWORD OPUS_EMAIL_RECEIVER
export OPUS_EMAIL_PORT OPUS_EMAIL_SECURE OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED
export OPUS_HCAPTCHA_SECRET LETSENCRYPT_EMAIL

.PHONY: update auto-refresh Dockerfile Dockerfile.dbtools
update: Dockerfile Dockerfile.dbtools
	./run-opus-web-with-db-update.sh

auto-refresh: Dockerfile Dockerfile.dbtools
	./bin/auto-refresh-opus-db.sh

Dockerfile: Dockerfile.template
	cp $< $@

Dockerfile.dbtools: Dockerfile.dbtools.template
	cp $< $@
