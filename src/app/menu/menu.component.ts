import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIf } from "@angular/common";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})
export class MenuComponent implements OnInit {
  isLoggedIn = false;
  dropdownOpen: boolean = false;
  sidebarOpen: boolean = false;
  userName: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe((token) => {
      this.isLoggedIn = !!token;
      if (token) {
        const payload = this.authService.getUserInfoFromToken();
        if (payload?.email) {
          this.userService
            .getUserByEmail(payload.email)
            .subscribe((user: any) => {
              this.userName = user?.nome || null;
            });
        }
      } else {
        this.userName = null;
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
  logout() {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  preencherCadastroComUsuarioLogado() {
    const payload = this.authService.getUserInfoFromToken();
    if (payload?.email) {
      this.userService.getUserByEmail(payload.email).subscribe((user: any) => {
        // Salva os dados no localStorage para o cadastro pegar
        localStorage.setItem(
          "cadastroUser",
          JSON.stringify({
            firstName: user.first_Name || user.firstName || "",
            lastName: user.last_Name || user.lastName || "",
            email: user.email || "",
            password: "", // nunca preenche senha
            companyId: user.companyId || 1,
          })
        );
      });
    }
  }
}
