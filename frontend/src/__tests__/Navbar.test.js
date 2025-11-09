import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import { Navbar } from "@/components/Navbar";

// Mock the useUser hook
jest.mock("@/hooks/use-user");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe("Navbar", () => {
  it("renders the dashboard title", () => {
    useUser.mockReturnValue({ user: null });
    renderNavbar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays user information when logged in", () => {
    const mockUser = {
      username: "testuser",
      email: "test@example.com",
    };
    useUser.mockReturnValue({ user: mockUser });
    renderNavbar();

    // Check for user's name and email
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // Check for user's initials in the avatar
    expect(screen.getByText("te")).toBeInTheDocument();
  });

  it("displays loading state when user is being fetched", () => {
    useUser.mockReturnValue({ user: null, loading: true });
    renderNavbar();
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it('navigates to profile page on profile button click', () => {
    const mockUser = {
      username: "testuser",
      email: "test@example.com",
    };
    useUser.mockReturnValue({ user: mockUser });
    renderNavbar();

    const profileButton = screen.getByText("Profile");
    profileButton.click();
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});
