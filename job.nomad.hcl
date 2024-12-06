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
{{ end }}
NODE_ENV=production
PLS_URL=http://pls.nomad.dsekt.internal
LOGIN_API_URL=http://sso.nomad.dsekt.internal/legacyapi
LOGIN_FRONTEND_URL=https://sso.datasektionen.se/legacyapi
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
