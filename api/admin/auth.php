<?php
/**
 * Admin Authentication API
 * Handles login/logout for admin users
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once __DIR__ . '/../config/database.php';

session_start();

class AdminAuth {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function login($username, $password) {
        try {
            // Get admin user from database
            $query = "SELECT id, username, password_hash, email, role, active FROM admin_users WHERE username = :username AND active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password_hash'])) {
                // Create session
                $_SESSION['admin_id'] = $user['id'];
                $_SESSION['admin_username'] = $user['username'];
                $_SESSION['admin_role'] = $user['role'];
                $_SESSION['admin_logged_in'] = true;
                
                // Update last login
                $updateQuery = "UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = :id";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(':id', $user['id']);
                $updateStmt->execute();
                
                return [
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Invalid username or password'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Login error: ' . $e->getMessage()
            ];
        }
    }
    
    public function logout() {
        session_destroy();
        return [
            'success' => true,
            'message' => 'Logged out successfully'
        ];
    }
    
    public function checkAuth() {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            return [
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'id' => $_SESSION['admin_id'],
                    'username' => $_SESSION['admin_username'],
                    'role' => $_SESSION['admin_role']
                ]
            ];
        } else {
            return [
                'success' => true,
                'authenticated' => false
            ];
        }
    }
    
    public function requireAuth() {
        $auth = $this->checkAuth();
        if (!$auth['authenticated']) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Authentication required'
            ]);
            exit();
        }
        return $auth['user'];
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$auth = new AdminAuth();

try {
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
                exit();
            }
            
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'login':
                        if (!isset($input['username']) || !isset($input['password'])) {
                            http_response_code(400);
                            echo json_encode(['success' => false, 'message' => 'Username and password required']);
                            exit();
                        }
                        
                        $result = $auth->login($input['username'], $input['password']);
                        http_response_code($result['success'] ? 200 : 401);
                        echo json_encode($result);
                        break;
                        
                    case 'logout':
                        $result = $auth->logout();
                        echo json_encode($result);
                        break;
                        
                    default:
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Invalid action']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Action required']);
            }
            break;
            
        case 'GET':
            // Check authentication status
            $result = $auth->checkAuth();
            echo json_encode($result);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>