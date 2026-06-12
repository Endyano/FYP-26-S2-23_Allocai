from Manager import Manager 

def run_test():
    print("⏳ Initializing Manager instance...")
    manager = Manager()
    
    # Define a brand new mock staff member to insert
    test_name = "Test Assistant 1"
    test_email = "test_assistant1@sim.com"
    test_password = "securepassword123"

    print(f"Attempting to create a new profile for: {test_name} ({test_email})...")
    
    # Execute your new class method
    response = manager.create_staff(
        full_name=test_name,
        email=test_email,
        password=test_password
    )
    
    # Print out results cleanly
    print("\n--- 📝 BACKEND EXECUTION RESULT ---")
    print(f"Success Status: {response.get('success')}")
    print(f"Message: {response.get('message')}")
    
    if response.get('success'):
        print("\n✨ Returned Profile Data Row:")
        # response.get('profile') returns a dict. Using .items() lets us see 
        # exactly what columns came back from the Supabase RETURNING clause.
        profile_data = response.get('profile', {})
        if profile_data:
            for key, value in profile_data.items():
                print(f"  └─ {key}: {value}")
        else:
            print("Warning: 'profile' key is empty in success response.")
    print("-----------------------------------\n")

if __name__ == "__main__":
    run_test()