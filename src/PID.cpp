#include <algorithm>
#include <math.h>
#include "PID.h"

PID::PID(double k_new, double T_i_new, double T_d_new, double eSumMax_new, int resolution_new) : k(k_new), T_i(T_i_new), T_d(T_d_new), eSumMax(eSumMax_new), resolution(resolution_new)
{
}

double PID::P(double e_i)
{
    return k * e_i;
}
double PID::I(double e_i)
{
    if (T_i == 0)
        return 0;

    eSum += e_i;

    // Anti-Windup
    eSum = std::max(std::min(eSum, eSumMax), -eSumMax);

    return eSum / T_i;
}
double PID::D(double e_i)
{
    double result = T_d * (e_i - prev_e);
    prev_e = e_i;

    return result;
}
double PID::calculate_u(double e_i)
{
    lastP = P(e_i);
    lastI = I(e_i);
    lastD = D(e_i);
    int sum = lastP + lastI + lastD;
    int modifier = 1;
    if (sum < 0)
        modifier *= -1;

    return (int)((pow(abs(sum), 2)) / pow(2, resolution)) * modifier; //^2 then /RESOLUTION for the lower values in the begining (better wrampup)
}
void PID::resetMemory()
{
    eSum = 0;
    prev_e = 0;
}
PID::~PID() {}