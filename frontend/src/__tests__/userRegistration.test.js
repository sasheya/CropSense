import { registerUser } from '../services/apiService'; // Adjust the import path as necessary

describe('User Registration API', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    };

    const response = await registerUser(userData);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('username', userData.username);
    expect(response.data).toHaveProperty('email', userData.email);
  });

  it('should handle registration failure with invalid data', async () => {
    const invalidUserData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'short',
    };

    try {
      await registerUser(invalidUserData);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('message');
    }
  });
});