#include <iostream>
#include <bits/stdc++.h>

using namespace std;

struct Rules {
    string condition1;
    string condition2;
    string fact;
    string inference;
};

vector<Rules> knowledgeBase = {
    {"cold", "cough", "viral infection",
     "cold and cough both give viral infection"},

    {"high thermometer temperature", "",
     "fever",
     "fever is a direct symptom"},

    {"viral infection", "lung problem",
     "COVID",
     "covid is strong since lung disease"}
};

set<string> facts;

int main() {

    vector<string> symptoms = {
        "cold",
        "cough",
        "high thermometer temperature",
        "lung problem"
    };

    cout << "Enter y for YES and n for NO\n";

    // Input symptoms
    for(int i = 0; i < symptoms.size(); i++) {

        cout << "Has symptom "
             << symptoms[i]
             << " ? (y/n): ";

        string ans;
        cin >> ans;

        if(ans == "y") {
            facts.insert(symptoms[i]);
        }
    }

    vector<bool> usedRule(knowledgeBase.size(), false);

    bool newFactFound = true;

    // Forward Chaining
    while(newFactFound) {

        newFactFound = false;

        for(int i = 0; i < knowledgeBase.size(); i++) {

            if(usedRule[i])
                continue;

            if(facts.count(knowledgeBase[i].condition1)) {

                if(knowledgeBase[i].condition2 == "" ||

                   facts.count(knowledgeBase[i].condition2)) {

                    facts.insert(knowledgeBase[i].fact);

                    usedRule[i] = true;

                    cout << "\nRule Applied: "
                         << knowledgeBase[i].inference
                         << endl;

                    newFactFound = true;
                }
            }
        }
    }

    cout << "\nFinal Facts Derived:\n";

    #include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <cmath>
#include <algorithm>

using namespace std;

const vector<int> GOAL = {1, 2, 3, 4, 5, 6, 7, 8, 0};

struct State {
    vector<int> board;
    int g; // Moves from start
    int h; // Heuristic distance
    string path;

    // Min-heap comparison based on (g + h)
    bool operator>(const State& other) const {
        return (g + h) > (other.g + other.h);
    }
};

// Calculate Manhattan Distance
int getHeuristic(const vector<int>& board) {
    int dist = 0;
    for (int i = 0; i < 9; ++i) {
        if (board[i] != 0) {
            dist += abs((board[i] - 1) / 3 - i / 3) + abs((board[i] - 1) % 3 - i % 3);
        }
    }
    return dist;
}

// Print Board
void printBoard(const vector<int>& board) {
    cout << "+-------+\n";
    for (int i = 0; i < 9; ++i) {
        if (i % 3 == 0) cout << "| ";
        cout << (board[i] == 0 ? "_" : to_string(board[i])) << " ";
        if (i % 3 == 2) cout << "|\n";
    }
    cout << "+-------+\n";
}

// A* Algorithm
void solve(vector<int> start) {
    priority_queue<State, vector<State>, greater<State>> pq;
    set<vector<int>> visited;

    pq.push({start, 0, getHeuristic(start), ""});
    
    // Grid movement configuration
    int dRow[] = {-1, 1, 0, 0}, dCol[] = {0, 0, -1, 1};
    string moves[] = {"UP", "DOWN", "LEFT", "RIGHT"};
    int statesExplored = 0;

    while (!pq.empty()) {
        State curr = pq.top();
        pq.pop();

        if (visited.count(curr.board)) continue;
        visited.insert(curr.board);
        statesExplored++;

        if (curr.board == GOAL) {
            cout << "\n✅ GOAL REACHED!\nTotal Moves: " << curr.g 
                 << "\nStates Explored: " << statesExplored 
                 << "\nPath: " << curr.path << "\n\nFinal Board:\n";
            printBoard(curr.board);
            return;
        }

        // Find the empty space (0)
        int zeroPos = find(curr.board.begin(), curr.board.end(), 0) - curr.board.begin();
        int r = zeroPos / 3, c = zeroPos % 3;

        for (int i = 0; i < 4; ++i) {
            int nr = r + dRow[i], nc = c + dCol[i];
            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                vector<int> nextBoard = curr.board;
                swap(nextBoard[zeroPos], nextBoard[nr * 3 + nc]);

                if (!visited.count(nextBoard)) {
                    pq.push({nextBoard, curr.g + 1, getHeuristic(nextBoard), curr.path + moves[i] + " "});
                }
            }
        }
    }
    cout << " No solution found!\n";
}

int main() {
    vector<int> start = {1, 2, 3, 4, 0, 6, 7, 5, 8};

    cout << "=== A* 8-Puzzle Solver ===\n\nStart State:\n";
    printBoard(start);
    cout << "\nGoal State:\n";
    printBoard(GOAL);
    
    cout << "\nSolving...\n";
    solve(start);

    return 0;
}

    for(auto x : facts) {
        cout << x << endl;
    }

    return 0;
}
