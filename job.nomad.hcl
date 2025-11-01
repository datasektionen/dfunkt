job "dfunkt" {
  namespace = "auth"

  type = "service"

  group "dfunkt" {
    network {
      port "http" { }
    }

    service {
      name     = "dfunkt"
      port     = "http"
      provider = "nomad"
      tags = [
        "traefik.enable=true",
        "traefik.http.routers.dfunkt.rule=Host(`dfunkt.datasektionen.se`)",
        "traefik.http.routers.dfunkt.tls.certresolver=default",

        "traefik.http.routers.dfunkt-internal.rule=Host(`dfunkt.nomad.dsekt.internal`)",
        "traefik.http.routers.dfunkt-internal.entrypoints=web-internal",
      ]
    }

    task "dfunkt" {
      driver = "docker"

      config {
        image = var.image_tag
        ports = ["http"]
      }

      template {
        data        = <<ENV
PORT={{ env "NOMAD_PORT_http" }}
{{ with nomadVar "nomad/jobs/dfunkt" }}
SESSION_SECRET={{ .session_secret }}
DATABASE_URL=postgres://dfunkt:{{ .database_password }}@postgres.dsekt.internal:5432/dfunkt
LOGIN_KEY={{ .login_api_key }}
HIVE_API_KEY={{ .hive_api_key }}
OIDC_SECRET={{ .oidc_secret }}
{{ end }}
NODE_ENV=production
HIVE_URL=http://hive.nomad.dsekt.internal/api/v1
OIDC_ID=dfunkt
OIDC_PROVIDER=https://sso.datasektionen.se/op
REDIRECT_URL=https://dfunkt.datasektionen.se/login/callback
ENV
        destination = "local/.env"
        env         = true
      }
    }
  }
}

variable "image_tag" {
  type = string
  default = "ghcr.io/datasektionen/dfunkt:latest"
}
