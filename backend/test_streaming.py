#!/usr/bin/env python3
"""
Test script to verify streaming content generation functionality
"""

import asyncio
import json
from src.features.creator_agent.service.graph_generate_content import graph as content_graph

async def test_streaming_generation():
    """Test the streaming content generation with a simple course structure"""
    
    # Sample course structure (similar to what frontend sends)
    test_structure = {
        "title": "Test Course",
        "modules": [
            {
                "id": "module_1",
                "title": "Test Module",
                "lessons": [
                    {
                        "id": "lesson_1",
                        "title": "Test Lesson 1",
                        "description": "A simple test lesson",
                        "content": None
                    },
                    {
                        "id": "lesson_2", 
                        "title": "Test Lesson 2",
                        "description": "Another test lesson",
                        "content": None
                    }
                ]
            }
        ]
    }
    
    # Initial state
    initial_state = {
        "course_structure": test_structure,
        "user_id": "test_user"
    }
    
    config = {
        "configurable": {"thread_id": "test_thread"},
        "recursion_limit": 100
    }
    
    print("🔄 Testing streaming content generation...")
    print("=" * 60)
    
    try:
        # Test streaming modes
        async for mode, chunk in content_graph.astream(
            initial_state,
            config,
            stream_mode=["values", "messages", "updates"]
        ):
            print(f"[{mode.upper()}] ", end="")
            
            if mode == "messages":
                token, _ = chunk
                if hasattr(token, 'content'):
                    print(f"Message: {token.content}")
                    
            elif mode == "values":
                other_values = {k: v for k, v in chunk.items() 
                              if k not in ["messages", "course_structure"] and v is not None}
                if other_values:
                    print(f"Values: {other_values}")
                    
            elif mode == "updates":
                for node_name, state_update in chunk.items():
                    if "messages" in state_update and state_update["messages"]:
                        for msg in state_update["messages"]:
                            if hasattr(msg, 'content'):
                                print(f"Update from {node_name}: {msg.content}")
                    
                    # Check for special streaming data
                    special_keys = ["lesson_generated", "lesson_saved", "quiz_generated", "formation_completed"]
                    for key in special_keys:
                        if key in state_update:
                            print(f"Special data from {node_name}: {key} = {state_update[key]}")
        
        print("=" * 60)
        print("✅ Streaming test completed successfully!")
        
    except Exception as e:
        print("=" * 60)
        print(f"❌ Streaming test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_streaming_generation())