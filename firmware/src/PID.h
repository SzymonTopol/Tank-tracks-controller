#pragma once
#include <algorithm>

class PID
{
private:
    double k;        // proportional gain
    double T_i;      // integral time
    double T_d;      // derivitive time
    double prev_e = 0; // previous error
    double eSum = 0;   // sum of errors
    double eSumMax;    // maximum error sum (for clamping)
    int resolution;

    double lastP = 0;
    double lastI = 0;
    double lastD = 0;

public:
    PID(double k_new, double T_i_new, double T_d_new, double eSumMax_new, int resolution_new);
    ~PID();
    
    double P(double e_i);
    double I(double e_i);
    double D(double e_i);
    double calculate_u(double e_i);

    void setProportionalGain(double k_new) { k = std::max(0.0, k_new); }
    void setIntegralTime(double T_i_new) { T_i = std::max(0.0, T_i_new); }
    void setDerivitiveTime(double T_d_new) { T_d = std::max(0.0, T_d_new); }
    void setClamp(int clamp) { eSumMax = std::max(0.0, (double)clamp); }

    double getProportionalGain() { return k; }
    double getIntegralTime() { return T_i; }
    double getDerivitiveTime() { return T_d; }
    int getClamp() { return (int)eSumMax; }

    double getLastP() { return lastP; }
    double getLastI() { return lastI; }
    double getLastD() { return lastD; }

    void resetMemory();
    int getResolution() { return resolution; }
};