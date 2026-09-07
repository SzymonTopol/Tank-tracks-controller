#pragma once

class PID
{
private:
    double k;        // proportional gain
    double T_i;      // integral time
    double T_d;      // derivitive time
    int prev_e = 0;  // previous error
    double eSum = 0; // sum of errors
    double eSumMax;
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

    void setProportionalGain(double k_new) { k = k_new; }
    void setIntegralTime(double T_i_new) { T_i = T_i_new; }
    void setDerivitiveTime(double T_d_new) { T_d = T_d_new; }

    double getProportionalGain() { return k; }
    double getIntegralTime() { return T_i; }
    double getDerivitiveTime() { return T_d; }

    double getLastP() { return lastP; }
    double getLastI() { return lastI; }
    double getLastD() { return lastD; }

    void resetMemory();
    int getResolution() { return resolution; }
};