
OPUS_EMAIL_SERVER=mail.domain.com
OPUS_EMAIL_USER=info@domain.com
OPUS_EMAIL_PASSWORD=password123
OPUS_EMAIL_RECEIVER=someguy@domain.com
OPUS_HCAPTCHA_SECRET=
OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED=true
LETSENCRYPT_EMAIL=email@domain.com

ifneq ($(wildcard opus-secrets.mk),)
  include opus-secrets.mk
endif

.PHONY: update auto-refresh
update: Dockerfile Dockerfile.dbtools
	./run-opus-web-with-db-update.sh

auto-refresh: Dockerfile Dockerfile.dbtools
	./bin/auto-refresh-opus-db.sh

Dockerfile: Dockerfile.template
	sed 	-e 's/OPUS_EMAIL_SERVER=mail.domain.com/OPUS_EMAIL_SERVER=${OPUS_EMAIL_SERVER}/' \
		-e 's/OPUS_EMAIL_USER=info@domain.com/OPUS_EMAIL_USER=${OPUS_EMAIL_USER}/' \
		-e 's/OPUS_EMAIL_PASSWORD=password123/OPUS_EMAIL_PASSWORD=${OPUS_EMAIL_PASSWORD}/' \
		-e 's/OPUS_EMAIL_RECEIVER=someguy@domain.com/OPUS_EMAIL_RECEIVER=${OPUS_EMAIL_RECEIVER}/' \
		-e 's/OPUS_HCAPTCHA_SECRET=/OPUS_HCAPTCHA_SECRET=${OPUS_HCAPTCHA_SECRET}/' \
		-e 's/OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED=true/OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED=${OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED}/' \
		-e 's/LETSENCRYPT_EMAIL=email@domain.com/LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}/' \
	< $< > $@

Dockerfile.dbtools: Dockerfile.dbtools.template
	sed 	-e 's/OPUS_EMAIL_SERVER=mail.domain.com/OPUS_EMAIL_SERVER=${OPUS_EMAIL_SERVER}/' \
		-e 's/OPUS_EMAIL_USER=info@domain.com/OPUS_EMAIL_USER=${OPUS_EMAIL_USER}/' \
		-e 's/OPUS_EMAIL_PASSWORD=password123/OPUS_EMAIL_PASSWORD=${OPUS_EMAIL_PASSWORD}/' \
		-e 's/OPUS_EMAIL_RECEIVER=someguy@domain.com/OPUS_EMAIL_RECEIVER=${OPUS_EMAIL_RECEIVER}/' \
		-e 's/OPUS_HCAPTCHA_SECRET=/OPUS_HCAPTCHA_SECRET=${OPUS_HCAPTCHA_SECRET}/' \
		-e 's/OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED=true/OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED=${OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED}/' \
		-e 's/LETSENCRYPT_EMAIL=email@domain.com/LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}/' \
	< $< > $@
